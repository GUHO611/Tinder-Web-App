"use client";

import { UserProfile } from "@/lib/actions/profile";
import ChatHeader from "@/components/ChatHeader";
import StreamChatInterface from "@/components/StreamChatInterface";
import { useAuth } from "@/contexts/auth-context";
import { useMessage } from "@/contexts/message-context";
import { getUserMatches } from "@/lib/actions/matches";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

export default function ChatConversationPage() {
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [inCall, setInCall] = useState(false);
  const [currentCallId, setCurrentCallId] = useState<string>("");
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const { markAsRead } = useMessage();
  const userId = params.userId as string;

  // Ref cho animation
  const containerRef = useRef<HTMLDivElement>(null);
  const shapesRef = useRef<HTMLDivElement>(null);

  const chatInterfaceRef = useRef<{ handleVideoCall: () => void } | null>(null);

  // --- 1. DATA FETCHING ---
  useEffect(() => {
    async function loadUserData() {
      try {
        const userMatches = await getUserMatches();
        const matchedUser = userMatches.find((match) => match.id === userId);

        if (matchedUser) {
          setOtherUser(matchedUser);
        } else {
          router.push("/chat");
        }
      } catch (error) {
        console.error(error);
        router.push("/chat");
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [userId, router]);

  // --- 2. MARK AS READ ---
  useEffect(() => {
    if (userId && user && !loading) {
      const sortedIds = [user.id, userId].sort();
      const combinedIds = sortedIds.join("_");
      let hash = 0;
      for (let i = 0; i < combinedIds.length; i++) {
        const char = combinedIds.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      const channelId = `match_${Math.abs(hash).toString(36)}`;
      markAsRead(channelId);
    }
  }, [userId, user, loading, markAsRead]);

  // --- 3. BACKGROUND ANIMATION (GSAP) ---
  useEffect(() => {
    if (!shapesRef.current) return;

    const ctx = gsap.context(() => {
      // Tạo hiệu ứng trôi nổi cho các hình tròn (blobs)
      const shapes = gsap.utils.toArray(".floating-shape") as HTMLElement[];

      shapes.forEach((shape, i) => {
        gsap.to(shape, {
          x: "random(-100, 100)",
          y: "random(-100, 100)",
          rotation: "random(-180, 180)",
          scale: "random(0.8, 1.2)",
          duration: "random(10, 20)",
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 2
        });
      });

      // Hiệu ứng xuất hiện mượt mà cho khung chat
      gsap.from(".chat-container", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.2
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleVideoCallFromHeader = () => {
    chatInterfaceRef.current?.handleVideoCall();
  };

  const handleCallStart = (callId: string) => {
    setCurrentCallId(callId);
    setInCall(true);
  };

  const handleCallEnd = () => {
    setInCall(false);
    setCurrentCallId("");
  };

  // --- RENDER LOADING ---
  if (loading) {
    return (
      <div
        className="h-screen w-full flex items-center justify-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #FFDEE9 0%, #B5FFFC 100%)" }}
      >
        <div className="bg-white/40 backdrop-blur-md p-8 rounded-3xl shadow-xl flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-pink-500 mb-4 shadow-lg"></div>
          <p className="text-gray-700 font-medium animate-pulse">Đang kết nối trái tim...</p>
        </div>
      </div>
    );
  }

  // --- RENDER NOT FOUND ---
  if (!otherUser) {
    return (
      <div
        className="h-screen w-full flex items-center justify-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #FFDEE9 0%, #B5FFFC 100%)" }}
      >
        <div className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl shadow-2xl max-w-md text-center border border-white/50">
          <div className="text-6xl mb-4 drop-shadow-sm">💔</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy người ấy</h2>
          <p className="text-gray-600 mb-6">Kết nối này có vẻ không tồn tại hoặc đã bị gián đoạn.</p>
          <button
            onClick={() => router.push("/chat")}
            className="bg-gradient-to-r from-pink-400 to-purple-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  // --- MAIN RENDER ---
  return (
    <div
      ref={containerRef}
      className="h-screen w-full relative overflow-hidden flex justify-center"
      style={{ background: "linear-gradient(135deg, #FFDEE9 0%, #B5FFFC 100%)" }}
    >
      {/* 1. BACKGROUND EFFECTS (FLOATING SHAPES) */}
      <div ref={shapesRef} className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="floating-shape absolute top-[10%] left-[10%] w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="floating-shape absolute top-[20%] right-[10%] w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="floating-shape absolute bottom-[10%] left-[20%] w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* 2. MAIN CHAT CONTAINER (GLASSMORPHISM) */}
      <div className="chat-container w-full max-w-5xl h-full md:h-[95vh] md:my-auto relative z-10 flex flex-col bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl shadow-2xl md:rounded-[30px] border border-white/40 dark:border-gray-700/50 overflow-hidden">

        {/* Header */}
        <div className="shrink-0 bg-white/40 dark:bg-gray-800/40 backdrop-blur-md border-b border-white/30 dark:border-gray-700/30">
          <ChatHeader
            user={otherUser}
            onVideoCall={handleVideoCallFromHeader}
          />
        </div>

        {/* Chat Body */}
        <div className="flex-1 min-h-0 bg-transparent">
          <StreamChatInterface
            otherUser={otherUser}
            ref={chatInterfaceRef}
            onCallStart={handleCallStart}
          />
        </div>
      </div>
    </div>
  );
}