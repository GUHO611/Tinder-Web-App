"use client";

import { UserProfile } from "@/lib/actions/profile"; // Import type chuẩn
import { getUserMatches } from "@/lib/actions/matches";
import { useEffect, useState } from "react";
import Link from "next/link";
import { calculateAge } from "@/lib/helpers/calculate-age";

export default function MatchesListPage() {
    const [matches, setMatches] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadMatches() {
            try {
                const userMatches = await getUserMatches();
                setMatches(userMatches);
            } catch (error) {
                console.error(error);
                setError("Không thể tải danh sách ghép đôi.");
            } finally {
                setLoading(false);
            }
        }

        loadMatches();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                        Đang tải danh sách ghép đôi...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800 pb-20">
            <div className="container mx-auto px-4 py-8">
                <header className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Danh sách ghép đôi
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Bạn có {matches.length} người ghép đôi
                    </p>
                </header>

                {matches.length === 0 ? (
                    <div className="text-center max-w-md mx-auto p-8">
                        <div className="w-24 h-24 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <span className="text-4xl">💕</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Chưa có tương hợp nào
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Hãy bắt đầu quẹt phải để tìm {'"nửa kia"'} của bạn!
                        </p>
                        <Link
                            href="/matches" // Hoặc trang chủ /home nơi có thẻ quẹt
                            className="inline-block bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold py-3 px-8 rounded-full hover:from-pink-600 hover:to-red-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                        >
                            Bắt đầu khám phá
                        </Link>
                    </div>
                ) : (
                    <div className="max-w-2xl mx-auto">
                        <div className="grid gap-4">
                            {matches.map((match) => (
                                <Link
                                    key={match.id} // Dùng ID làm key thay vì index
                                    href={`/chat/${match.id}`}
                                    className="group block bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-200 border border-transparent hover:border-pink-200 dark:hover:border-pink-900"
                                >
                                    <div className="flex items-center space-x-4">
                                        {/* Avatar */}
                                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-100 dark:border-gray-700">
                                            <img
                                                src={match.avatar_url || "/default-avatar.png"} // Fallback ảnh mặc định
                                                alt={match.full_name || "User"}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                                                    {match.full_name}, {match.birthdate ? calculateAge(match.birthdate) : "??"}
                                                </h3>
                                                {/* Online Status Indicator (Optional - Giả lập) */}
                                                <div className="flex-shrink-0 w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                            </div>

                                            {/* Display Address (New) */}
                                            {match.display_address && (
                                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 mr-1">
                                                        <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.62.829.799 1.654 1.38 2.274 1.766a11.25 11.25 0 001.04.573c.005.002.01.004.015.006l.004.002zm-1.018-8.604a2.25 2.25 0 113.182-1.272 2.25 2.25 0 01-3.182 1.272z" clipRule="evenodd" />
                                                    </svg>
                                                    {match.display_address}
                                                </div>
                                            )}

                                            {/* Bio */}
                                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">
                                                {match.bio || "Chưa có giới thiệu..."}
                                            </p>

                                            {/* Hobbies Preview (New) */}
                                            {match.hobbies && match.hobbies.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {match.hobbies.slice(0, 3).map((hobby, idx) => (
                                                        <span key={idx} className="text-[10px] px-2 py-0.5 bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-300 rounded-full border border-pink-100 dark:border-pink-800">
                                                            {hobby.icon} {hobby.name}
                                                        </span>
                                                    ))}
                                                    {match.hobbies.length > 3 && (
                                                        <span className="text-[10px] px-1.5 py-0.5 text-gray-400">+{match.hobbies.length - 3}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Chat Icon */}
                                        <div className="flex-shrink-0 text-gray-300 group-hover:text-pink-500 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.159 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
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