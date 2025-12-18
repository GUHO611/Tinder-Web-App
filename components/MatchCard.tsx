"use client";

import { UserProfile } from "@/lib/actions/profile";
import { calculateAge } from "@/lib/helpers/calculate-age";
import Image from "next/image";
import { useState, useMemo, useEffect } from "react";

export default function MatchCard({ user }: { user: UserProfile }) {
    // 1. Chuẩn bị danh sách ảnh
    const photos = useMemo(() => {
        let list: string[] = [];
        if (user.photos && user.photos.length > 0) {
            list = user.photos;
        } else if (user.avatar_url) {
            list = [user.avatar_url];
        } else {
            list = ["/default-avatar.png"];
        }
        return list;
    }, [user.photos, user.avatar_url]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false); // State để kiểm tra hover

    // 2. Logic tự động chuyển ảnh (Auto-slide)
    useEffect(() => {
        // Nếu chỉ có 1 ảnh hoặc đang hover thì không chạy auto
        if (photos.length <= 1 || isHovered) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % photos.length); // Loop vòng tròn
        }, 4000); // 2 giây

        return () => clearInterval(interval);
    }, [photos.length, isHovered]);

    // 3. Handlers điều hướng
    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation(); // Ngăn drag card
        e.preventDefault();
        setCurrentIndex((prev) => (prev + 1) % photos.length);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        // Logic lùi vòng tròn: (0 - 1 + length) % length
        setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    };

    return (
        <div
            className="relative w-full h-full max-w-sm mx-auto shadow-2xl rounded-3xl overflow-hidden bg-white dark:bg-gray-800 select-none"
            onMouseEnter={() => setIsHovered(true)} // Tạm dừng auto-slide
            onMouseLeave={() => setIsHovered(false)} // Tiếp tục auto-slide
        >

            <div className="w-full h-full relative group">

                {/* --- IMAGE --- */}
                <Image
                    key={currentIndex}
                    src={photos[currentIndex]}
                    alt={"${user.full_name} photo"}
                    fill
                    className="object-cover pointer-events-none transition-opacity duration-500"
                    priority={currentIndex === 0}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 pointer-events-none" />

                {/* --- INDICATORS (Thanh tiến trình) --- */}
                {photos.length > 1 && (
                    <div className="absolute top-2 left-0 right-0 flex gap-1 px-2 z-20">
                        {photos.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1 flex-1 rounded-full transition-all duration-300 ${idx === currentIndex ? "bg-white" : "bg-white/40"
                                    }`}
                            />
                        ))}
                    </div>
                )}

                {/* --- VISIBLE NAVIGATION BUTTONS (Hiện khi hover) --- */}
                {photos.length > 1 && (
                    <>
                        {/* Nút Trái */}
                        <button
                            onClick={handlePrev}
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/20 hover:bg-black/50 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
                            </svg>
                        </button>

                        {/* Nút Phải */}
                        <button
                            onClick={handleNext}
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/20 hover:bg-black/50 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </>
                )}

                {/* --- INFO SECTION --- */}
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white z-10 pointer-events-none">
                    <div className="flex flex-col gap-1 animate-fadeIn">

                        {/* Tên và Tuổi */}
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-3xl font-bold tracking-tight drop-shadow-md">
                                {user.full_name}
                            </h2>
                            <span className="text-2xl font-medium opacity-90">
                                {user.birthdate ? calculateAge(user.birthdate) : ""}
                            </span>
                        </div>

                        {/* Vị trí */}
                        {user.display_address && (
                            <div className="flex items-center text-sm font-medium opacity-90 mb-2 text-gray-200">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                                    <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.62.829.799 1.654 1.38 2.274 1.766a11.25 11.25 0 001.04.573c.005.002.01.004.015.006l.004.002zm-1.018-8.604a2.25 2.25 0 113.182-1.272 2.25 2.25 0 01-3.182 1.272z" clipRule="evenodd" />
                                </svg>
                                {user.display_address}
                            </div>
                        )}

                        {/* Bio */}
                        <p className="text-sm opacity-90 mb-3 line-clamp-2 leading-relaxed font-light drop-shadow-sm">
                            {user.bio || "Chưa có giới thiệu..."}
                        </p>

                        {/* Hobbies */}
                        {user.hobbies && user.hobbies.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {user.hobbies.slice(0, 3).map((hobby, idx) => (
                                    <span key={idx} className="text-xs font-semibold px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30 shadow-sm">
                                        {hobby.icon} {hobby.name}
                                    </span>
                                ))}
                                {user.hobbies.length > 3 && (
                                    <span className="text-xs font-semibold px-2 py-1 bg-white/10 rounded-full border border-white/20">
                                        +{user.hobbies.length - 3}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}