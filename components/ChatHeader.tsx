"use client";

import { UserProfile } from "@/lib/actions/profile";
import { calculateAge } from "@/lib/helpers/calculate-age";
import { useRouter } from "next/navigation";

interface ChatHeaderProps {
  user: UserProfile;
  onVideoCall?: () => void;
}

export default function ChatHeader({ user, onVideoCall }: ChatHeaderProps) {
  const router = useRouter();

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <svg
              className="w-6 h-6 text-gray-600 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <img
                  src={user.avatar_url || "/default-avatar.png"}
                  alt={user.full_name}
                  className="w-full h-full object-cover"
                />

                {user.is_online ? (
                  <div className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center z-20">
                    {/* Vòng nhấp nháy tỏa ra */}
                    <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>

                    {/* Chấm tròn chính */}
                    <div className="relative w-4 h-4 bg-green-500 rounded-full border-[2.5px] border-white dark:border-gray-800 shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
                  </div>
                ) : (
                  // Tùy chọn: Hiển thị thời gian hoạt động gần nhất nếu offline
                  user.last_active && (
                    <div className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center z-20">
                      {/* Chấm tròn chính */}
                      <div className="relative w-4 h-4 bg-gray-500 rounded-full border-[2.5px] border-white dark:border-gray-800 shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
                    </div>
                  )
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {user.full_name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                @{user.username}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onVideoCall}
            className="p-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110"
            title="Bắt đầu Video Call"
          >
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
