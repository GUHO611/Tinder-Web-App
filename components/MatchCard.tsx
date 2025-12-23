"use client";

import { UserProfile } from "@/lib/actions/profile";
import { calculateAge } from "@/lib/helpers/calculate-age";
import Image from "next/image";
import { useState, useMemo, useEffect } from "react";

export default function MatchCard({ user }: { user: UserProfile }) {
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
    const [isHovered, setIsHovered] = useState(false);
    const [expandBio, setExpandBio] = useState(false);

    // Auto-slide logic
    useEffect(() => {
        if (photos.length <= 1 || isHovered || expandBio) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % photos.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [photos.length, isHovered, expandBio]);

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setCurrentIndex((prev) => (prev + 1) % photos.length);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    };

    const toggleBio = (e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandBio(!expandBio);
    };

    return (
        <div
            className="relative w-full h-full max-w-sm mx-auto shadow-2xl rounded-3xl overflow-hidden bg-white dark:bg-gray-800 select-none group/card"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="w-full h-full relative">

                {/* --- IMAGE --- */}
                <Image
                    key={currentIndex}
                    src={photos[currentIndex]}
                    alt={`${user.full_name} photo`}
                    fill
                    className={`object-cover pointer-events-none transition-transform duration-700 ease-out ${isHovered ? 'scale-105' : 'scale-100'}`}
                    priority={currentIndex === 0}
                />

                {/* Gradient Overlay */}
                <div
                    className={`absolute inset-0 bg-gradient-to-b from-black/10 via-transparent pointer-events-none transition-all duration-500
                    ${expandBio ? 'to-black/95 via-black/80' : 'to-black/90'}`}
                />

                {/* --- INDICATORS --- */}
                {photos.length > 1 && (
                    <div className="absolute top-2 left-0 right-0 flex gap-1 px-3 z-30">
                        {photos.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1 flex-1 rounded-full transition-all duration-300 shadow-sm ${idx === currentIndex ? "bg-white" : "bg-white/30"}`}
                            />
                        ))}
                    </div>
                )}

                {/* --- NAVIGATION BUTTONS (Z-Index cao: z-50) --- */}
                {photos.length > 1 && !expandBio && (
                    <>
                        <button
                            onClick={handlePrev}
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-50 p-2 rounded-full bg-white/10 hover:bg-white/30 text-white backdrop-blur-md transition-all opacity-0 group-hover/card:opacity-100 hover:scale-110 border border-white/20"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
                            </svg>
                        </button>

                        <button
                            onClick={handleNext}
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-50 p-2 rounded-full bg-white/10 hover:bg-white/30 text-white backdrop-blur-md transition-all opacity-0 group-hover/card:opacity-100 hover:scale-110 border border-white/20"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </>
                )}

                {/* --- INFO SECTION --- */}
                {/* Dùng pointer-events-none cho container cha để click xuyên qua vùng trống */}
                {/* Chỉ bật pointer-events-auto khi Bio mở rộng hoặc cho các phần tử con */}
                <div
                    className={`absolute bottom-0 left-0 right-0 p-5 text-white z-40 transition-all duration-500 ease-in-out flex flex-col justify-end
                    ${expandBio ? 'h-[85%] overflow-y-auto custom-scrollbar pointer-events-auto' : 'h-auto pointer-events-none'}`}
                >
                    <div className="flex flex-col gap-3">

                        {/* NAME & AGE */}
                        <div className="flex items-end justify-between pointer-events-auto">
                            <div className="flex flex-col">
                                <h2 className="text-3xl font-extrabold tracking-tight drop-shadow-lg text-white">
                                    {user.full_name}
                                </h2>
                                <div className="mt-1 inline-flex items-center self-start px-2 py-0.5 rounded-md bg-orange-500/20 border border-orange-500/50 backdrop-blur-sm">
                                    <span className="text-sm font-bold text-orange-200">
                                        {user.birthdate ? calculateAge(user.birthdate) : "??"} tuổi
                                    </span>
                                </div>
                            </div>

                            {/* ĐÃ BỎ NÚT 3 CHẤM Ở ĐÂY */}
                        </div>

                        {/* LOCATION */}
                        {user.display_address && (
                            <div className="pointer-events-auto inline-flex items-center px-3 py-1.5 rounded-xl bg-blue-600/30 border border-blue-400/30 backdrop-blur-md w-fit transition-all hover:bg-blue-600/40">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5 text-blue-200">
                                    <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.62.829.799 1.654 1.38 2.274 1.766a11.25 11.25 0 001.04.573c.005.002.01.004.015.006l.004.002zm-1.018-8.604a2.25 2.25 0 113.182-1.272 2.25 2.25 0 01-3.182 1.272z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm font-medium text-blue-50">{user.display_address}</span>
                            </div>
                        )}

                        {/* BIO SECTION - Click để mở rộng */}
                        {user.bio && (
                            <div
                                onClick={toggleBio}
                                className={`pointer-events-auto relative rounded-2xl p-3 bg-white/10 border border-white/10 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:bg-white/20 active:scale-95
                                ${expandBio ? 'bg-white/20 border-white/30 shadow-lg' : ''}`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Giới thiệu</h4>
                                    {/* Icon chỉ dẫn nhỏ: Mở ra / Thu vào */}
                                    <span className="text-white/50">
                                        {expandBio ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832 6.29 12.77a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z" clipRule="evenodd" /></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                                        )}
                                    </span>
                                </div>
                                <p className={`text-sm leading-relaxed text-gray-100 font-light ${!expandBio ? 'line-clamp-2' : ''}`}>
                                    {user.bio}
                                </p>
                            </div>
                        )}

                        {/* HOBBIES */}
                        {user.hobbies && user.hobbies.length > 0 && (
                            <div className={`pointer-events-auto transition-all duration-500 ${!expandBio && user.hobbies.length > 3 ? 'opacity-90' : 'opacity-100'}`}>
                                <h4 className={`text-xs font-bold text-pink-300 uppercase mb-2 tracking-wider ${!expandBio ? 'hidden' : 'block'}`}>Sở thích</h4>
                                <div className="flex flex-wrap gap-2">
                                    {(expandBio ? user.hobbies : user.hobbies.slice(0, 3)).map((hobby, idx) => (
                                        <span
                                            key={idx}
                                            className="text-xs font-medium px-3 py-1.5 bg-pink-500/20 text-pink-100 rounded-full border border-pink-500/30 shadow-sm whitespace-nowrap"
                                        >
                                            {hobby.icon} {hobby.name}
                                        </span>
                                    ))}
                                    {!expandBio && user.hobbies.length > 3 && (
                                        <span className="text-xs font-semibold px-2.5 py-1.5 bg-white/10 rounded-full border border-white/20 text-white">
                                            +{user.hobbies.length - 3}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {expandBio && <div className="h-4" />}
                    </div>
                </div>
            </div>
        </div>
    );
}