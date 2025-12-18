"use client";
import { useEffect, useState } from "react";
import { getUserMatches } from "@/lib/actions/matches";
import Link from "next/link";
import { UserProfile } from "@/lib/actions/profile";
import { useRouter } from "next/navigation";

interface ChatData {
  id: string;
  user: UserProfile;
  lastMessage?: string;
  lastMessageTime: string;
  unreadCount: number;
}

export default function ChatPage() {
  const [chats, setChats] = useState<ChatData[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadMatches() {
      try {
        const userMatches = await getUserMatches();
        const chatData: ChatData[] = userMatches.map((match) => ({
          id: match.id,
          user: match,
          lastMessage: "Bắt đầu cuộc trò chuyện của bạn!",
          lastMessageTime: match.created_at,
          unreadCount: 0,
        }));
        setChats(chatData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadMatches();
  }, []);

  function formatTime(timestamp: string) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const MINUTE = 60;
    const HOUR = 60 * MINUTE;
    const DAY = 24 * HOUR;
    const WEEK = 7 * DAY;
    const MONTH = 30 * DAY;
    const YEAR = 365 * DAY;

    if (diffInSeconds < 30) {
      return "Vừa xong";
    } else if (diffInSeconds < MINUTE) {
      return `${diffInSeconds} giây trước`;
    } else if (diffInSeconds < HOUR) {
      const minutes = Math.floor(diffInSeconds / MINUTE);
      return `${minutes} phút trước`;
    } else if (diffInSeconds < DAY) {
      const hours = Math.floor(diffInSeconds / HOUR);
      return `${hours} giờ trước`;
    } else if (diffInSeconds < WEEK) {
      const days = Math.floor(diffInSeconds / DAY);
      return `${days} ngày trước`;
    } else if (diffInSeconds < MONTH) {
      const weeks = Math.floor(diffInSeconds / WEEK);
      return `${weeks} tuần trước`;
    } else if (diffInSeconds < YEAR) {
      const months = Math.floor(diffInSeconds / MONTH);
      return `${months} tháng trước`;
    } else {
      const years = Math.floor(diffInSeconds / YEAR);
      // Nếu chỉ muốn hiện "x năm trước"
      return `${years} năm trước`;

      // Hoặc nếu muốn hiện ngày cụ thể khi đã quá 1 năm, hãy dùng dòng dưới:
      // return date.toLocaleDateString("vi-VN", { year: "numeric", month: "numeric", day: "numeric" });
    }
  }

  if (loading) {
    return (
      <div className="h-full min-h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Đang tìm kiếm những người phù hợp...
          </p>
        </div>
      </div>
    );
  }

  const defaultAvatarUrl = "/default-avatar.png";

  const handleAvatarClick = (e: React.MouseEvent, userId: string) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/profile/${userId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Tin nhắn
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {chats.length} cuộc trò chuyện{chats.length !== 1 ? "" : ""}
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
              {chats.map((chat, key) => (
                <Link
                  key={key}
                  href={`/chat/${chat.id}`}
                  className="group block bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-200 border border-transparent hover:border-pink-200 dark:hover:border-pink-900"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className="relative flex-shrink-0 cursor-pointer z-10"
                      onClick={(e) => handleAvatarClick(e, chat.user.id)}
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-gray-100 dark:border-gray-700">
                        <div>
                          <img
                            src={chat.user.avatar_url || defaultAvatarUrl}
                            alt={chat.user.full_name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>

                        {chat.user.is_online ? (
                          <div className="absolute bottom-1 right-1 flex items-center justify-center z-20">
                            {/* Vòng nhấp nháy tỏa ra */}
                            <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>

                            {/* Chấm tròn chính */}
                            <div className="relative w-4 h-4 bg-green-500 rounded-full border-[2.5px] border-white dark:border-gray-800 shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
                          </div>
                        ) : (
                          // Tùy chọn: Hiển thị thời gian hoạt động gần nhất nếu offline
                          chat.user.last_active && (
                            <div className="absolute bottom-1 right-1 flex items-center justify-center z-20">
                              {/* Chấm tròn chính */}
                              <div className="relative w-4 h-4 bg-gray-500 rounded-full border-[2.5px] border-white dark:border-gray-800 shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
                            </div>
                          )
                        )}

                        {chat.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                            {chat.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 ml-4">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <h3
                            className="text-lg font-semibold text-gray-900 dark:text-white truncate hover:text-pink-500 cursor-pointer transition-colors z-10 relative"
                            onClick={(e) => handleAvatarClick(e, chat.user.id)}
                          >
                            {chat.user.full_name}
                          </h3>
                        </div>
                        {!chat.user.is_online && chat.user.last_active && (
                          <span className="text-[14px] text-gray-400 font-medium">
                            Online cách đây: {formatTime(chat.user.last_active)}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {chat.lastMessage}
                      </p>
                    </div>

                    {/* Chat Icon */}
                    <div className="flex-shrink-0 text-gray-300 group-hover:text-pink-500 transition-colors">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.159 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                        />
                      </svg>
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
