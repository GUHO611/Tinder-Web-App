"use client";

import { UserProfile } from "@/app/profile/page";
import { calculateAge } from "@/lib/helpers/calculate-age";
import { useRouter } from "next/navigation";

interface ChatHeaderProps {
  user: UserProfile;
}
export default function ChatHeader({ user }: ChatHeaderProps) {
  const router = useRouter();
  const defaultAvatarUrl = "default-avatar.png";
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
            <div className="relative w-12 h-12 rounded-full overflow-hidden">
              <img
                src={user.avatar_url || defaultAvatarUrl}
                alt={user.full_name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {user.full_name}, {calculateAge(user.birthdate)}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                @{user.username}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
