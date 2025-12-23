"use client";

import { UserProfile } from "@/lib/actions/profile";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Image from "next/image";

interface MatchNotificationProps {
    match: UserProfile;
    myAvatarUrl?: string;
    onClose: () => void;
    onStartChat: () => void;
}

export default function MatchNotification({
    match,
    myAvatarUrl = "/default-avatar.png",
    onClose,
    onStartChat,
}: MatchNotificationProps) {
    // Định nghĩa rõ kiểu Ref là HTMLDivElement
    const containerRef = useRef<HTMLDivElement>(null);
    const leftAvatarRef = useRef<HTMLDivElement>(null);
    const rightAvatarRef = useRef<HTMLDivElement>(null);
    const heartRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const buttonsRef = useRef<HTMLDivElement>(null);

    // Tạo mảng 20 phần tử để map ra hạt confetti
    const particles = Array.from({ length: 20 });

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline();

            // 1. Hiện nền mờ
            tl.to(containerRef.current, { opacity: 1, duration: 0.3 });

            // 2. Hai Avatar bay vào va nhau
            tl.fromTo([leftAvatarRef.current, rightAvatarRef.current],
                { x: (i: number) => i === 0 ? -300 : 300, opacity: 0, scale: 0.5, rotation: (i: number) => i === 0 ? -45 : 45 },
                {
                    x: 0,
                    opacity: 1,
                    scale: 1,
                    rotation: 0,
                    duration: 0.8,
                    ease: "elastic.out(1, 0.6)"
                }
            );

            // 3. Trái tim nổ ra ở giữa & Shockwave
            tl.fromTo(heartRef.current,
                { scale: 0, rotation: -180 },
                { scale: 1.2, rotation: 0, duration: 0.5, ease: "back.out(3)" },
                "-=0.6"
            );

            // 4. Particles nổ tung tóe (Fix lỗi 'any' ở đây)
            gsap.utils.toArray<HTMLElement>(".particle").forEach((particle) => {
                gsap.fromTo(particle,
                    { x: 0, y: 0, scale: 0, opacity: 1 },
                    {
                        x: () => gsap.utils.random(-200, 200),
                        y: () => gsap.utils.random(-200, 200),
                        scale: () => gsap.utils.random(0.5, 1.5),
                        opacity: 0,
                        duration: 1.5,
                        ease: "power4.out",
                        delay: 0.2
                    }
                );
            });

            // 5. Text & Buttons hiện lên
            tl.fromTo(textRef.current,
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
                "-=0.2"
            );

            // Chuyển HTMLCollection thành Array để TS không báo lỗi
            const buttonElements = buttonsRef.current ? Array.from(buttonsRef.current.children) : [];

            if (buttonElements.length > 0) {
                tl.fromTo(buttonElements,
                    { y: 20, opacity: 0 },
                    { y: 0, opacity: 1, stagger: 0.1, duration: 0.4, ease: "back.out(1.5)" }
                );
            }

        }, containerRef);

        return () => ctx.revert();
    }, []);

    const handleCloseAnimation = (callback: () => void) => {
        gsap.to(containerRef.current, {
            opacity: 0,
            y: 50,
            duration: 0.3,
            onComplete: callback
        });
    };

    const handleClose = () => handleCloseAnimation(onClose);
    const handleStartChat = () => handleCloseAnimation(onStartChat);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md opacity-0 overflow-hidden"
        >
            {/* --- PARTICLES --- */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {particles.map((_, i) => (
                    <div
                        key={i}
                        className="particle absolute w-3 h-3 rounded-full"
                        style={{
                            backgroundColor: ['#FF5C9D', '#FFC5D3', '#FFD700', '#FFFFFF'][i % 4]
                        }}
                    />
                ))}
            </div>

            <div className="relative w-full max-w-lg p-6 flex flex-col items-center">

                {/* --- AVATAR COLLISION AREA --- */}
                <div className="relative h-48 w-full flex justify-center items-center mb-8">

                    {/* LEFT AVATAR (MYSELF) */}
                    <div ref={leftAvatarRef} className="absolute z-10 -ml-16 transform translate-x-[-150%]">
                        <div className="w-32 h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden relative">
                            <Image
                                src={myAvatarUrl}
                                alt="Me"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>

                    {/* RIGHT AVATAR (MATCH) */}
                    <div ref={rightAvatarRef} className="absolute z-10 -mr-16 transform translate-x-[150%]">
                        <div className="w-32 h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden relative">
                            <Image
                                src={match.avatar_url || "/default-avatar.png"}
                                alt="Match"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>

                    {/* HEART EXPLOSION */}
                    <div ref={heartRef} className="absolute z-20 bg-white rounded-full p-3 shadow-xl transform scale-0">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-pink-500">
                            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                        </svg>
                    </div>
                </div>

                {/* --- TEXT CONTENT --- */}
                <div ref={textRef} className="text-center mb-8 space-y-2 relative z-30">
                    <h1 className="text-5xl md:text-6xl font-black italic transform -rotate-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-red-500 to-yellow-500 drop-shadow-sm font-sans tracking-tight">
                        IT&apos;S A MATCH!
                    </h1>
                    <p className="text-gray-200 text-lg font-medium max-w-xs mx-auto">
                        Bạn và <span className="text-pink-300 font-bold">{match.full_name}</span> đã thích nhau.
                    </p>
                </div>

                {/* --- BUTTONS --- */}
                <div ref={buttonsRef} className="flex flex-col gap-3 w-full max-w-xs relative z-30">
                    <button
                        onClick={handleStartChat}
                        className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-bold rounded-full shadow-lg shadow-pink-500/40 transform transition-transform hover:scale-105 active:scale-95 text-lg flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97z" clipRule="evenodd" />
                        </svg>
                        Gửi lời chào
                    </button>

                    <button
                        onClick={handleClose}
                        className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full border border-white/20 backdrop-blur-sm transition-colors"
                    >
                        Tiếp tục tìm kiếm
                    </button>
                </div>
            </div>
        </div>
    );
}