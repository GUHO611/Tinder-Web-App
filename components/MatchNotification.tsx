"use client";

import { UserProfile } from "@/lib/actions/profile";
import { useEffect, useState } from "react";

interface MatchNotificationProps {
    match: UserProfile;
    onClose: () => void;
    onStartChat: () => void;
}

export default function MatchNotification({
    match,
    onClose,
    onStartChat,
}: MatchNotificationProps) {
    const [isVisible, setIsVisible] = useState<boolean>(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose;
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    function handleClose() {
        setIsVisible(false);
        setTimeout(onClose, 300);
    }

    function handleStartChat() {
        onStartChat();
        handleClose();
    }

    const avatarSrc = (match.avatar_url && match.avatar_url.trim() !== "")
        ? match.avatar_url
        : "/default-avatar.png";

    return (
        <div
            className={`fixed top-4 right-4 z-50 transition-all duration-500 transform ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
                }`}
        >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-pink-100 dark:border-gray-700 p-5 max-w-sm w-full">
                <div className="flex items-start space-x-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-pink-500">
                        <img
                            src={avatarSrc}
                            alt={match.full_name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-red-600">
                                Tương hợp mới! 🎉
                            </h3>
                            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                            Bạn và <b>{match.full_name}</b> đã thích nhau!
                        </p>

                        <div className="flex space-x-2">
                            <button
                                onClick={handleStartChat}
                                className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-bold py-2 px-4 rounded-full shadow-md hover:shadow-lg transition-all"
                            >
                                Nhắn tin
                            </button>
                            <button
                                onClick={handleClose}
                                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold py-2 px-4 rounded-full hover:bg-gray-200 transition-all"
                            >
                                Để sau
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}