"use client";

import { getPotentialMatches, likeUser } from "@/lib/actions/matches";
import { useEffect, useState } from "react";
import { UserProfile } from "@/lib/actions/profile";
import { useRouter } from "next/navigation";
import MatchCard from "@/components/MatchCard";
import MatchButtons from "@/components/MatchButtons";
import MatchNotification from "@/components/MatchNotification";
import {
    motion,
    useMotionValue,
    useTransform,
    AnimatePresence,
    PanInfo,
} from "framer-motion";

export default function MatchesPage() {
    const router = useRouter();

    const [matches, setMatches] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    const [showMatchNotification, setShowMatchNotification] = useState(false);
    const [matchedUser, setMatchedUser] = useState<UserProfile | null>(null);

    const [exitDirection, setExitDirection] = useState<
        "left" | "right" | null
    >(null);

    // Card bay x theo drag
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-22, 22]);
    const likeOpacity = useTransform(x, [40, 150], [0, 1]);
    const nopeOpacity = useTransform(x, [-40, -150], [0, 1]);

    // Load list
    useEffect(() => {
        (async () => {
            try {
                const data = await getPotentialMatches();
                setMatches(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const topCard = matches[0];
    const backCards = matches.slice(1, 3);

    // Khi swipe bằng drag hoặc button
    const triggerSwipe = async (dir: "left" | "right") => {
        if (!topCard || exitDirection) return; // tránh gọi 2 lần

        // BƯu tiên 1: Bay ngay lập tức (UX mượt)
        setExitDirection(dir);

        //Ưu tiên 2: Gọi API song song, không chờ
        if (dir === "right") {
            try {
                const result = await likeUser(topCard.id);
                if (result.isMatch && result.matchedUser) {
                    setMatchedUser(result.matchedUser as UserProfile);
                    setShowMatchNotification(true);
                }
            } catch (err) {
                console.error("Like failed:", err);
                // Optional: Nếu API lỗi, vẫn cho bay card (offline-first UX)
                // hoặc có thể hiện toast "Không thể thích"
            }
        }
        // dir === "left" thì không cần gọi API gì cả → bay luôn
    };
    // Khi animation exit *kết thúc thật* → mới remove card
    const handleExitComplete = () => {
        setMatches((prev) => prev.slice(1)); // Luôn xóa phần tử đầu tiên

        setExitDirection(null);
        x.set(0);
    };
    type DragEvent = MouseEvent | TouchEvent | PointerEvent;

    const handleDragEnd = (e: DragEvent, info: PanInfo) => {
        const threshold = 120;

        if (info.offset.x > threshold) {
            triggerSwipe("right");
        } else if (info.offset.x < -threshold) {
            triggerSwipe("left");
        }
    };

    const handleStartChat = () => {
        if (matchedUser) {
            setShowMatchNotification(false);
            router.push(`/chat/${matchedUser.id}`);
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    if (!topCard) {
        return (
            <div className="h-screen flex flex-col items-center justify-center text-center p-8">
                <div className="text-5xl">💕</div>
                <h2 className="text-2xl font-bold mt-4">Hết hồ sơ</h2>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-6 bg-white text-pink-500 py-3 px-8 rounded-full shadow"
                >
                    Làm mới
                </button>

                {showMatchNotification && matchedUser && (
                    <MatchNotification
                        match={matchedUser}
                        onClose={() => setShowMatchNotification(false)}
                        onStartChat={handleStartChat}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="h-screen overflow-hidden relative bg-gradient-to-br from-slate-100 to-pink-50 dark:from-gray-900 dark:to-slate-800 flex flex-col">

            {/* HEADER */}
            <header className="absolute top-0 w-full z-50 p-4 flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="p-3 bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-full"
                >
                    <svg
                        className="w-6 h-6 text-gray-800 dark:text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                </button>

                <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-600">
                    StreamMatch
                </h1>
                <div className="w-10" />
            </header>

            {/* CARD STACK */}
            <div className="flex-1 flex items-center justify-center relative mt-10">
                <div className="relative w-full max-w-md h-[600px] sm:h-[650px]">
                    {/* BACK CARDS */}
                    {backCards.map((user, i) => {
                        const index = i + 1;

                        return (
                            <motion.div
                                key={user.id}
                                layoutId={`card-${user.id}`}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{
                                    opacity: 0.6 - index * 0.1,
                                    scale: 1 - index * 0.06,
                                    y: index * 18,
                                    rotate: -2 * index,
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 250,
                                    damping: 22,
                                }}
                                className="absolute w-[90%] sm:w-[360px] h-full left-1/2 -translate-x-1/2"
                            >
                                <MatchCard user={user} />
                            </motion.div>
                        );
                    })}

                    {/* TOP CARD */}
                    <AnimatePresence mode="wait" onExitComplete={handleExitComplete}>
                        {topCard && (
                            <motion.div
                                key={topCard.id}
                                layoutId={`card-${topCard.id}`}
                                style={{ x, rotate }}
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                onDragEnd={handleDragEnd}
                                whileTap={{ scale: 0.97 }}
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{
                                    x: exitDirection === "right" ? 800 : -800,
                                    rotate: exitDirection === "right" ? 25 : -25,
                                    opacity: 0,
                                    transition: { duration: 0.28 },
                                }}
                                className="absolute w-[90%] sm:w-[360px] h-full left-1/2 -translate-x-1/2"
                            >
                                <MatchCard user={topCard} />

                                {/* LIKE LABEL */}
                                <motion.div
                                    style={{ opacity: likeOpacity }}
                                    className="absolute top-10 left-6 border-4 border-green-500 text-green-500 font-bold text-4xl px-4 py-1 rounded-lg transform -rotate-12 z-50 bg-black/20 backdrop-blur-sm"
                                >
                                    THÍCH
                                </motion.div>

                                {/* NOPE LABEL */}
                                <motion.div
                                    style={{ opacity: nopeOpacity }}
                                    className="absolute top-10 right-6 border-4 border-red-500 text-red-500 font-bold text-4xl px-4 py-1 rounded-lg transform rotate-12 z-50 bg-black/20 backdrop-blur-sm"
                                >
                                    KHÔNG
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* BUTTONS */}
            <div className="pb-8 w-full max-w-sm mx-auto px-6 z-50">
                <MatchButtons
                    onLike={() => triggerSwipe("right")}
                    onPass={() => triggerSwipe("left")}
                    disabled={!topCard}
                />
            </div>

            {showMatchNotification && matchedUser && (
                <MatchNotification
                    match={matchedUser}
                    onClose={() => setShowMatchNotification(false)}
                    onStartChat={handleStartChat}
                />
            )}
        </div>
    );
}
