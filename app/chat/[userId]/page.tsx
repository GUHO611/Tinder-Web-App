"use client";

import { UserProfile } from "@/lib/actions/profile";
import ChatHeader from "@/components/ChatHeader";
import StreamChatInterface from "@/components/StreamChatInterface";
import VideoCall from "@/components/VideoCall";
import { useAuth } from "@/contexts/auth-context";
import { getUserMatches } from "@/lib/actions/matches";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function ChatConversationPage() {
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [inCall, setInCall] = useState(false);
  const [currentCallId, setCurrentCallId] = useState<string>("");
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const userId = params.userId as string;

  const chatInterfaceRef = useRef<{ handleVideoCall: () => void } | null>(null);

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

  if (!otherUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Không tìm thấy người dùng
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Người dùng bạn đang tìm không tồn tại hoặc bạn không có quyền
            trò chuyện với họ!
          </p>
          <button
            onClick={() => router.push("/chat")}
            className="bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold py-3 px-6 rounded-full hover:from-pink-600 hover:to-red-600 transition-all duration-200"
          >
            Quay lại Tin nhắn
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto h-full flex flex-col relative">
        <ChatHeader
          user={otherUser}
          onVideoCall={handleVideoCallFromHeader}
        />

        <div className="flex-1 min-h-0">
          <StreamChatInterface
            otherUser={otherUser}
            ref={chatInterfaceRef}
            onCallStart={handleCallStart}
          />
        </div>

        {/* OVERLAY VIDEO CALL */}
        {inCall && currentCallId && (
          <VideoCall
            callId={currentCallId}
            onCallEnd={handleCallEnd}
          />
        )}
      </div>
    </div>
  );
}