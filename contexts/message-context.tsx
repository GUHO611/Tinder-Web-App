"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useRef, useCallback } from "react";
import { getGlobalStreamClient } from "@/lib/stream-chat-client";
import { ChannelFilters, ChannelOptions, ChannelSort, Event as StreamEvent, StreamChat, Channel } from "stream-chat";
import { useAuth } from "./auth-context";
import { UserProfile } from "@/lib/actions/profile";
import { getUserMatches } from "@/lib/actions/matches"; // Import action lấy matches

// Định nghĩa Interface dữ liệu Chat ngay tại Context để dùng chung
export interface ChatData {
  id: string; // Match ID
  user: UserProfile;
  lastMessage?: string;
  lastMessageTime: string;
  unreadCount: number;
  channelId: string;
  isLastMessageMine?: boolean;
}

interface MessageContextType {
  unreadCount: number;
  unreadByChannel: Record<string, number>;
  chatList: ChatData[]; // Thêm danh sách chat vào Context
  isLoadingChats: boolean; // Trạng thái loading
  markAsRead: (channelId: string) => void;
  refreshState: () => Promise<void>; // Đổi tên từ refreshUnreadCount thành refreshState cho đúng nghĩa
  user: UserProfile | null;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

// Helper function
function generateChannelId(userId1: string, userId2: string): string {
  const sortedIds = [userId1, userId2].sort();
  const combinedIds = sortedIds.join("_");
  let hash = 0;
  for (let i = 0; i < combinedIds.length; i++) {
    const char = combinedIds.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `match_${Math.abs(hash).toString(36)}`;
}

export function MessageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;

  // State
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [unreadByChannel, setUnreadByChannel] = useState<Record<string, number>>({});
  const [chatList, setChatList] = useState<ChatData[]>([]); // State mới: Danh sách chat
  const [isLoadingChats, setIsLoadingChats] = useState<boolean>(true); // State loading
  const [dataOwnerId, setDataOwnerId] = useState<string | null>(null);

  // Refs
  const isMountedRef = useRef<boolean>(true);
  const isFetchingRef = useRef<boolean>(false);
  const lastFetchTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const markAsRead = useCallback(async (channelId: string) => {
    try {
      const client = await getGlobalStreamClient();
      if (!client) return;

      const channel = client.channel('messaging', channelId);
      await channel.markRead();

      if (isMountedRef.current) {
        // Optimistic Update: Cập nhật UI ngay lập tức
        setUnreadByChannel((prev) => {
          const newUnread = { ...prev };
          delete newUnread[channelId];
          const totalUnread = Object.values(newUnread).reduce((sum, count) => sum + count, 0);
          setUnreadCount(totalUnread);
          return newUnread;
        });

        // Cập nhật lại chatList local để xóa chấm đỏ ngay
        setChatList(prevList =>
          prevList.map(chat =>
            chat.channelId === channelId ? { ...chat, unreadCount: 0 } : chat
          )
        );
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, []);

  // --- HÀM FETCH TOÀN DIỆN (Matches + Stream Data) ---
  const refreshState = useCallback(async () => {
    if (!userId) return;

    const now = Date.now();
    // Throttle 2s để tránh spam request
    if (isFetchingRef.current || (now - lastFetchTimeRef.current < 2000)) {
      return;
    }

    try {
      isFetchingRef.current = true;

      // 1. Lấy danh sách Matches từ DB
      const userMatches = await getUserMatches();

      const client = await getGlobalStreamClient();
      if (!client) {
        isFetchingRef.current = false;
        return;
      }

      // 2. Chuẩn bị IDs để query Stream
      const channelIds: string[] = [];
      userMatches.forEach(match => {
        channelIds.push(generateChannelId(userId, match.id));
      });

      let streamChannels: Channel[] = [];

      // 3. Query Stream Chat (chỉ 1 request duy nhất)
      if (channelIds.length > 0) {
        const filters: ChannelFilters = { type: 'messaging', id: { $in: channelIds } };
        const sort: ChannelSort = { last_message_at: -1 };
        const options: ChannelOptions = { limit: 50, state: true, watch: true };
        streamChannels = await client.queryChannels(filters, sort, options);
      }

      // 4. Xử lý dữ liệu (Mapping Matches + Stream Info)
      let totalUnread = 0;
      const unreadMap: Record<string, number> = {};

      const processedChatList: ChatData[] = userMatches.map(match => {
        const channelId = generateChannelId(userId, match.id);
        const streamChannel = streamChannels.find(c => c.id === channelId);

        let lastMessageText = "Bắt đầu cuộc trò chuyện của bạn!";
        let lastMessageTime = match.created_at;
        let isMine = false;
        let unread = 0;

        if (streamChannel) {
          // Lấy unread count
          unread = streamChannel.countUnread();
          if (unread > 0) {
            unreadMap[channelId] = unread;
            totalUnread += unread;
          }

          // Lấy tin nhắn cuối
          if (streamChannel.state.messages.length > 0) {
            const messages = streamChannel.state.messages;
            const lastMsg = messages[messages.length - 1];

            if (lastMsg.text) {
              lastMessageText = lastMsg.text;
            } else if (lastMsg.attachments && lastMsg.attachments.length > 0) {
              lastMessageText = "Đã gửi một tệp đính kèm";
            }
            if (lastMsg.deleted_at) {
              lastMessageText = "Tin nhắn đã bị thu hồi";
            }

            lastMessageTime = lastMsg.created_at
              ? (typeof lastMsg.created_at === 'string' ? lastMsg.created_at : lastMsg.created_at.toISOString())
              : match.created_at;

            isMine = lastMsg.user?.id === userId;
          }
        }

        return {
          id: match.id,
          user: match,
          lastMessage: lastMessageText,
          lastMessageTime: lastMessageTime,
          unreadCount: unread,
          channelId,
          isLastMessageMine: isMine
        };
      });

      // Sắp xếp theo thời gian mới nhất
      processedChatList.sort((a, b) =>
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );

      if (isMountedRef.current) {
        setUnreadByChannel(unreadMap);
        setUnreadCount(totalUnread);
        setChatList(processedChatList);
        setDataOwnerId(userId);
        setIsLoadingChats(false); // Đã tải xong
        lastFetchTimeRef.current = Date.now();
      }

    } catch (error) {
      console.error('Error refreshing chat state:', error);
    } finally {
      isFetchingRef.current = false;
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setDataOwnerId(null);
      setChatList([]);
      setIsLoadingChats(true);
      return;
    }

    lastFetchTimeRef.current = 0;
    refreshState();

    let client: StreamChat | null = null;

    const handleEvent = async (event: StreamEvent) => {
      // Chỉ refresh khi có tin nhắn mới (bất kể của ai để cập nhật Last Message) hoặc notification
      lastFetchTimeRef.current = 0;
      await refreshState();
    };

    const setupListeners = async () => {
      client = await getGlobalStreamClient();
      if (!client || !isMountedRef.current) return;

      client.on('notification.message_new', handleEvent);
      client.on('message.new', handleEvent);
      client.on('message.read', handleEvent);
      client.on('notification.channel_updated', handleEvent);

      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        lastFetchTimeRef.current = 0;
        refreshState();
      }, 30000);
    };

    setupListeners();

    return () => {
      if (client) {
        client.off('notification.message_new', handleEvent);
        client.off('message.new', handleEvent);
        client.off('message.read', handleEvent);
        client.off('notification.channel_updated', handleEvent);
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [userId, refreshState]);

  // Masking Data
  const isDataFresh = userId === dataOwnerId;
  const exposedUnreadCount = (user && isDataFresh) ? unreadCount : 0;
  const exposedChatList = (user && isDataFresh) ? chatList : [];
  const exposedLoading = (user && isDataFresh) ? isLoadingChats : true;

  return (
    <MessageContext.Provider
      value={{
        unreadCount: exposedUnreadCount,
        unreadByChannel: (user && isDataFresh) ? unreadByChannel : {},
        chatList: exposedChatList, // Expose danh sách chat
        isLoadingChats: exposedLoading, // Expose loading state
        markAsRead,
        refreshState,
        user: user as UserProfile | null,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
}

export function useMessage() {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error("useMessage must be used within a MessageProvider");
  }
  return context;
}