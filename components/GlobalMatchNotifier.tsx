"use client";

import { useMessage } from "@/contexts/message-context";
import MatchNotification from "@/components/MatchNotification";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

export default function GlobalMatchNotifier() {
    const { latestMatch, clearLatestMatch } = useMessage();
    const { user } = useAuth(); // Lấy thông tin user hiện tại để lấy avatar
    const router = useRouter();

    // Nếu không có match mới thì không render gì cả
    if (!latestMatch) return null;

    const handleStartChat = () => {
        clearLatestMatch(); // Tắt popup
        // Chuyển hướng đến trang chat với người đó
        router.push(`/chat/${latestMatch.id}`);
    };

    return (
        <MatchNotification
            match={latestMatch}
            myAvatarUrl={user?.user_metadata?.avatar_url || "/default-avatar.png"} // Lấy avatar của mình
            onClose={clearLatestMatch}
            onStartChat={handleStartChat}
        />
    );
}