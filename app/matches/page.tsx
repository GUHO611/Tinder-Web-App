"use client";

import { getPotentialMatches, likeUser } from "@/lib/actions/matches";
import { useEffect, useState } from "react";
// QUAN TRỌNG: Import UserProfile từ file actions chuẩn
import { UserProfile } from "@/lib/actions/profile";
import { useRouter } from "next/navigation";
import MatchCard from "@/componemts/MatchCard";
import MatchButtons from "@/componemts/MatchButtons";
import MatchNotification from "@/componemts/MatchNotification";

export default function MatchesPage() {
    const [potentialMatches, setPotentialMatches] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [showMatchNotification, setShowMatchNotification] = useState(false);
    const [matchedUser, setMatchedUser] = useState<UserProfile | null>(null);

    const router = useRouter();

    useEffect(() => {
        async function loadUsers() {
            try {
                // Hàm này đã được sửa ở bước trước để trả về đúng UserProfile[] kèm location/hobbies
                const potentialMatchesData = await getPotentialMatches();
                setPotentialMatches(potentialMatchesData);
            } catch (error) {
                console.error("Error loading matches:", error);
            } finally {
                setLoading(false);
            }
        }

        loadUsers();
    }, []);

    async function handleLike() {
        if (currentIndex < potentialMatches.length) {
            const likedUser = potentialMatches[currentIndex];

            try {
                const result = await likeUser(likedUser.id);

                if (result.isMatch && result.matchedUser) {
                    // Ép kiểu về UserProfile chuẩn nếu cần thiết
                    setMatchedUser(result.matchedUser as UserProfile);
                    setShowMatchNotification(true);
                }

                // Chuyển sang người tiếp theo
                setCurrentIndex((prev) => prev + 1);
            } catch (err) {
                console.error(err);
            }
        }
    }

    function handlePass() {
        if (currentIndex < potentialMatches.length) {
            setCurrentIndex((prev) => prev + 1);
        }
    }

    function handleCloseMatchNotification() {
        setShowMatchNotification(false);
        setMatchedUser(null);
    }

    function handleStartChat() {
        if (matchedUser) {
            setShowMatchNotification(false);
            router.push(`/chat/${matchedUser.id}`);
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

    // Hết danh sách
    if (currentIndex >= potentialMatches.length) {
        return (
            <div className="h-full min-h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="w-24 h-24 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <span className="text-4xl">💕</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Hết hồ sơ để hiển thị
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Hãy quay lại sau để xem thêm, hoặc thử thay đổi sở thích của bạn!
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold py-3 px-6 rounded-full hover:from-pink-600 hover:to-red-600 transition-all duration-200 shadow-md"
                    >
                        Làm mới
                    </button>
                </div>
                {showMatchNotification && matchedUser && (
                    <MatchNotification
                        match={matchedUser}
                        onClose={handleCloseMatchNotification}
                        onStartChat={handleStartChat}
                    />
                )}
            </div>
        );
    }

    const currentPotentialMatch = potentialMatches[currentIndex];

    return (
        <div className="h-full min-h-screen overflow-y-auto bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800 pb-20">
            <div className="container mx-auto px-4 py-8">
                <header className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 rounded-full hover:bg-white/20 dark:hover:bg-gray-700/50 transition-colors duration-200"
                            title="Go back"
                        >
                            <svg
                                className="w-6 h-6 text-gray-700 dark:text-gray-300"
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
                        <div className="flex-1" />
                    </div>

                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Khám Phá
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Hồ sơ thứ {currentIndex + 1} / {potentialMatches.length}
                        </p>
                    </div>
                </header>

                <div className="max-w-md mx-auto">
                    {/* Card hiển thị thông tin người dùng */}
                    <MatchCard user={currentPotentialMatch} />

                    {/* Nút Like / Pass */}
                    <div className="mt-8">
                        <MatchButtons onLike={handleLike} onPass={handlePass} />
                    </div>
                </div>

                {/* Popup khi Match thành công */}
                {showMatchNotification && matchedUser && (
                    <MatchNotification
                        match={matchedUser}
                        onClose={handleCloseMatchNotification}
                        onStartChat={handleStartChat}
                    />
                )}
            </div>
        </div>
    );
}