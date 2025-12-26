"use client";

import { createClient } from "@/lib/supabase/client";
import { createContext, useContext, useEffect, useState, ReactNode, useRef, useCallback } from "react";
import { getGlobalStreamClient } from "@/lib/stream-chat-client";
import { ChannelFilters, ChannelOptions, ChannelSort, Event as StreamEvent, StreamChat, Channel } from "stream-chat";
import { useAuth } from "./auth-context";
import { UserProfile } from "@/lib/actions/profile";
import { getUserMatches } from "@/lib/actions/matches";
import { getUserProfileById } from "@/lib/actions/profile"; // Đảm bảo import hàm này

// Định nghĩa Interface dữ liệu Chat
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
  chatList: ChatData[];
  isLoadingChats: boolean;
  markAsRead: (channelId: string) => void;
  refreshState: () => Promise<void>;
  user: UserProfile | null;

  // --- MỚI THÊM: State cho Popup Match ---
  latestMatch: UserProfile | null;
  clearLatestMatch: () => void;
}
// Định nghĩa cấu trúc 1 dòng trong bảng 'matches'
interface MatchRow {
  id: string;
  user1_id: string;
  user2_id: string;
  is_active: boolean;
  created_at: string;
}

interface RealtimeMatchPayload {
  new: MatchRow;          // Dữ liệu dòng mới
  old: MatchRow | null;   // Dữ liệu dòng cũ
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  schema: string;
  table: string;
  commit_timestamp: string;
  errors: null | { message: string; code?: string }[];
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
  const [chatList, setChatList] = useState<ChatData[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState<boolean>(true);
  const [dataOwnerId, setDataOwnerId] = useState<string | null>(null);

  // --- MỚI THÊM: State lưu Match mới nhất để hiện Popup ---
  const [latestMatch, setLatestMatch] = useState<UserProfile | null>(null);

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
        setUnreadByChannel((prev) => {
          const newUnread = { ...prev };
          delete newUnread[channelId];
          const totalUnread = Object.values(newUnread).reduce((sum, count) => sum + count, 0);
          setUnreadCount(totalUnread);
          return newUnread;
        });

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

  const clearLatestMatch = useCallback(() => {
    setLatestMatch(null);
  }, []);

  // --- HÀM FETCH TOÀN DIỆN (Matches + Stream Data) ---
  const refreshState = useCallback(async () => {
    if (!userId) return;

    const now = Date.now();
    if (isFetchingRef.current || (now - lastFetchTimeRef.current < 2000)) {
      return;
    }

    try {
      isFetchingRef.current = true;

      const userMatches = await getUserMatches();
      const client = await getGlobalStreamClient();
      if (!client) {
        isFetchingRef.current = false;
        return;
      }

      const channelIds: string[] = [];
      userMatches.forEach(match => {
        channelIds.push(generateChannelId(userId, match.id));
      });

      let streamChannels: Channel[] = [];

      if (channelIds.length > 0) {
        const filters: ChannelFilters = { type: 'messaging', id: { $in: channelIds } };
        const sort: ChannelSort = { last_message_at: -1 };
        const options: ChannelOptions = { limit: 50, state: true, watch: true };
        streamChannels = await client.queryChannels(filters, sort, options);
      }

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
          unread = streamChannel.countUnread();
          if (unread > 0) {
            unreadMap[channelId] = unread;
            totalUnread += unread;
          }

          if (streamChannel.state.messages.length > 0) {
            const messages = streamChannel.state.messages;
            const lastMsg = messages[messages.length - 1];

            if (lastMsg.text) lastMessageText = lastMsg.text;
            else if (lastMsg.attachments?.length) lastMessageText = "Đã gửi một tệp đính kèm";
            if (lastMsg.deleted_at) lastMessageText = "Tin nhắn đã bị thu hồi";

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

      processedChatList.sort((a, b) =>
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );

      if (isMountedRef.current) {
        setUnreadByChannel(unreadMap);
        setUnreadCount(totalUnread);
        setChatList(processedChatList);
        setDataOwnerId(userId);
        setIsLoadingChats(false);
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

    const supabase = createClient();

    // --- HÀM XỬ LÝ KHI CÓ MATCH MỚI ---
    const handleNewMatch = async (payload: RealtimeMatchPayload) => {
      console.log("🔔 Realtime Match Event:", payload);

      // TypeScript hiểu 'newRecord' là MatchRow
      const newRecord = payload.new;

      // ... logic giữ nguyên ...
      lastFetchTimeRef.current = 0;
      await refreshState();

      const partnerId = newRecord.user1_id === userId ? newRecord.user2_id : newRecord.user1_id;

      if (partnerId) {
        try {
          const partnerProfile = await getUserProfileById(partnerId);
          // Kiểm tra isMountedRef.current để tránh set state khi component đã unmount
          if (partnerProfile && isMountedRef.current) {
            setLatestMatch(partnerProfile);
          }
        } catch (err) {
          // Ép kiểu error sang Error hoặc unknown để log an toàn
          console.error("Lỗi lấy thông tin match mới:", err instanceof Error ? err.message : "Unknown error");
        }
      }
    };
    const realtimeChannel = supabase.channel('realtime-matches-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches',
          filter: `user1_id=eq.${userId}`,
        },
        (payload) => handleNewMatch(payload as unknown as RealtimeMatchPayload))
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches',
          filter: `user2_id=eq.${userId}`,
        },
        (payload) => handleNewMatch(payload as unknown as RealtimeMatchPayload))
      .subscribe();

    // --- STREAM CHAT LISTENERS ---
    let streamClient: StreamChat | null = null;

    const handleStreamEvent = async () => {
      lastFetchTimeRef.current = 0;
      await refreshState();
    };

    const setupListeners = async () => {
      streamClient = await getGlobalStreamClient();
      if (!streamClient || !isMountedRef.current) return;

      streamClient.on('notification.message_new', handleStreamEvent);
      streamClient.on('message.new', handleStreamEvent);
      streamClient.on('message.read', handleStreamEvent);
      streamClient.on('notification.channel_updated', handleStreamEvent);

      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        lastFetchTimeRef.current = 0;
        refreshState();
      }, 30000);
    };

    setupListeners();

    return () => {
      supabase.removeChannel(realtimeChannel);

      if (streamClient) {
        streamClient.off('notification.message_new', handleStreamEvent);
        streamClient.off('message.new', handleStreamEvent);
        streamClient.off('message.read', handleStreamEvent);
        streamClient.off('notification.channel_updated', handleStreamEvent);
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
        chatList: exposedChatList,
        isLoadingChats: exposedLoading,
        markAsRead,
        refreshState,
        user: user as UserProfile | null,

        // Expose state mới
        latestMatch,
        clearLatestMatch,
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
