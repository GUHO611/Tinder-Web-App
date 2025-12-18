// app/chat/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getUserMatches } from "@/lib/actions/matches";
import Link from "next/link";
import { UserProfile } from "@/lib/actions/profile";
import { useRouter } from "next/navigation";
import { getGlobalStreamClient } from "@/lib/stream-chat-client";
import { createOrGetChannel } from "@/lib/actions/stream";

interface ChatData {
  id: string;
  user: UserProfile;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  channel: any;
}

export default function ChatPage() {
  const [chats, setChats] = useState<ChatData[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadChats() {
      try {
        const client = await getGlobalStreamClient();
        const userMatches = await getUserMatches();

        const chatPromises = userMatches.map(async (match) => {
          const { channelId } = await createOrGetChannel(match.id);
          const channel = client.channel("messaging", channelId);
          await channel.watch();

          const messages = channel.state.messages || [];
          const lastMsg = messages[messages.length - 1];

          return {
            id: match.id,
            user: match,
            lastMessage: lastMsg?.text || "Bắt đầu cuộc trò chuyện của bạn!",
            lastMessageTime: lastMsg?.created_at || match.created_at,
            unreadCount: channel.countUnread(),
            channel,
          };
        });

        let resolvedChats = await Promise.all(chatPromises);

        resolvedChats = resolvedChats.sort((a, b) => {
          const timeA = a.lastMessageTime || a.user.created_at || "0";
          const timeB = b.lastMessageTime || b.user.created_at || "0";
          return new Date(timeB).getTime() - new Date(timeA).getTime();
        });

        setChats(resolvedChats);
      } catch (error) {
        console.error("Error loading chats:", error);
      } finally {
        setLoading(false);
      }
    }

    loadChats();
  }, []);

  useEffect(() => {
    async function setupRealtime() {
      try {
        const client = await getGlobalStreamClient();

        const handleUpdate = () => {
          setChats((prev) =>
            prev
              .map((chat) => ({
                ...chat,
                unreadCount: chat.channel.countUnread(),
                lastMessage:
                  (chat.channel.state.messages || [])[
                    (chat.channel.state.messages || []).length - 1
                  ]?.text || chat.lastMessage,
                lastMessageTime:
                  (chat.channel.state.messages || [])[
                    (chat.channel.state.messages || []).length - 1
                  ]?.created_at || chat.lastMessageTime,
              }))
              .sort((a, b) => {
                const timeA = a.lastMessageTime || a.user.created_at || "0";
                const timeB = b.lastMessageTime || b.user.created_at || "0";
                return new Date(timeB).getTime() - new Date(timeA).getTime();
              })
          );
        };

        client.on("message.new", handleUpdate);
        client.on("message.read", handleUpdate);
        client.on("notification.mark_read", handleUpdate);

        return () => {
          client.off("message.new", handleUpdate);
          client.off("message.read", handleUpdate);
          client.off("notification.mark_read", handleUpdate);
        };
      } catch (error) {
        console.error("Realtime setup error:", error);
      }
    }

    setupRealtime();
  }, []);

  function formatTime(timestamp?: string) {
    if (!timestamp) return "Vừa xong";

    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);

    if (diffInSeconds < 60) return "Vừa xong";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;

    return date.toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  }

  const defaultAvatarUrl = "/default-avatar.png";

  const handleAvatarClick = (e: React.MouseEvent, userId: string) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/profile/${userId}`);
  };

  if (loading) {
    return (
      <div className="h-full min-h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Đang tải tin nhắn...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Tin nhắn
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {chats.length} cuộc trò chuyện
          </p>
        </header>

        {chats.length === 0 ? (
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">💬</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Chưa có cuộc trò chuyện nào
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Hãy bắt đầu vuốt để tìm người phù hợp và bắt đầu trò chuyện!
            </p>
            <Link
              href="/matches"
              className="bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold py-3 px-6 rounded-full hover:from-pink-600 hover:to-red-600 transition-all duration-200"
            >
              Bắt đầu vuốt
            </Link>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="grid space-y-4">
              {chats.map((chat) => (
                <Link
                  key={chat.id}
                  href={`/chat/${chat.id}`}
                  className="group block bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-200 border border-transparent hover:border-pink-200 dark:hover:border-pink-900"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative flex-shrink-0 cursor-pointer z-10"
                      onClick={(e) => handleAvatarClick(e, chat.user.id)}>
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-gray-100 dark:border-gray-700">
                        <img
                          src={chat.user.avatar_url || defaultAvatarUrl}
                          alt={chat.user.full_name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute bottom-1 right-1 flex items-center justify-center z-20">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
                          <div className="relative w-4 h-4 bg-green-500 rounded-full border-[2.5px] border-white dark:border-gray-800 shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
                        </div>

                        {chat.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-6 h-6 flex items-center justify-center shadow-lg">
                            {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 ml-4">
                      <div className="flex items-center justify-between mb-1">
                        <h3
                          className="text-lg font-semibold text-gray-900 dark:text-white truncate hover:text-pink-500 cursor-pointer transition-colors"
                          onClick={(e) => handleAvatarClick(e, chat.user.id)}
                        >
                          {chat.user.full_name}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                          {formatTime(chat.lastMessageTime)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {chat.lastMessage}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}