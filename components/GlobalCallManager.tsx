"use client";

import { useEffect, useState } from "react";
import { StreamChat, Event } from "stream-chat";
import { getStreamUserToken } from "@/lib/actions/stream";
import VideoCall from "./VideoCall";

// Interface cho dữ liệu cuộc gọi đính kèm trong tin nhắn
interface VideoCallCustomData extends Record<string, unknown> {
  call_id?: string;
  caller_id?: string;
  caller_name?: string;
  caller_image?: string; // <-- Đọc trường này
  text?: string;
}

export default function GlobalCallManager() {
  const [incomingCallId, setIncomingCallId] = useState<string>("");
  const [callerId, setCallerId] = useState<string>("");
  const [callerName, setCallerName] = useState<string>("");
  const [callerImage, setCallerImage] = useState<string>(""); // <-- State lưu ảnh
  const [showIncomingCall, setShowIncomingCall] = useState(false);
  
  const [activeCallId, setActiveCallId] = useState<string>("");
  const [showActiveCall, setShowActiveCall] = useState(false);
  
  const [client, setClient] = useState<StreamChat | null>(null);

  useEffect(() => {
    let chatClient: StreamChat;

    async function initGlobalListener() {
      try {
        const { token, userId, userName, userImage } = await getStreamUserToken();
        
        if (!userId) return;

        chatClient = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_API_KEY!);

        if (chatClient.userID !== userId) {
          await chatClient.connectUser(
            {
              id: userId,
              name: userName,
              image: userImage,
            },
            token
          );
        }

        const handleNewEvent = (event: Event) => {
          if (event.message?.text?.includes("📹 Video call invitation")) {
            const customData = event.message as unknown as VideoCallCustomData;
            const currentUserId = chatClient?.userID;

            if (customData.caller_id && customData.caller_id !== currentUserId) {
              setIncomingCallId(customData.call_id || "");
              setCallerId(customData.caller_id);

              // CẬP NHẬT: Lấy ảnh từ customData trước, nếu không có thì fallback sang event.user
              setCallerName(customData.caller_name || event.user?.name || "Ai đó");
              setCallerImage(customData.caller_image || event.user?.image || "");

              setShowIncomingCall(true);
            }
          }
        };

        chatClient.on("notification.message_new", handleNewEvent);
        chatClient.on("message.new", handleNewEvent);

        setClient(chatClient);
      } catch (error) {
        console.error("Global Call Listener Error:", error);
      }
    }

    initGlobalListener();

    return () => {
      if (chatClient) {
        chatClient.off("notification.message_new");
        chatClient.off("message.new");
      }
    };
  }, []);

  const handleAcceptCall = async () => {
    // Send acceptance message to caller first
    if (client && incomingCallId) {
      try {
        // Calculate channelId same way as server
        const currentUserId = client.userID!;
        const otherUserId = callerId;

        const sortedIds = [currentUserId, otherUserId].sort();
        const combinedIds = sortedIds.join("_");

        let hash = 0;
        for (let i = 0; i < combinedIds.length; i++) {
          const char = combinedIds.charCodeAt(i);
          hash = (hash << 5) - hash + char;
          hash = hash & hash;
        }

        const channelId = `match_${Math.abs(hash).toString(36)}`;

        // Get or create the channel
        const channel = client.channel("messaging", channelId);

        // Send acceptance message
        const acceptanceData = {
          text: `📹 Call accepted - joining now`,
          call_id: incomingCallId,
          acceptor_id: currentUserId,
          call_accepted: true,
        };

        await channel.sendMessage(acceptanceData);
        console.log("Sent call acceptance message from GlobalCallManager");
      } catch (error) {
        console.error("Error sending acceptance message:", error);
      }
    }

    setShowIncomingCall(false);
    // Join the call immediately for receiver
    setActiveCallId(incomingCallId);
    setShowActiveCall(true);

    setIncomingCallId("");
    setCallerId("");
    setCallerName("");
    setCallerImage("");
  };

  const handleDeclineCall = () => {
    setShowIncomingCall(false);
    setIncomingCallId("");
    setCallerId("");
    setCallerName("");
    setCallerImage("");
  };

  const handleCallEnd = () => {
    setShowActiveCall(false);
    setActiveCallId("");
  };

  if (!showIncomingCall && !showActiveCall) return null;

  return (
    <>
      {/* --- MODAL THÔNG BÁO CUỘC GỌI ĐẾN --- */}
      {showIncomingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-sm mx-4 shadow-2xl animate-pulse-fade border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-4 border-pink-500 relative">
                 {/* Hiển thị ảnh Caller */}
                 <img
                  src={callerImage || "/default-avatar.png"} 
                  alt={callerName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/default-avatar.png";
                  }}
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Cuộc gọi Video đến
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                <span className="font-bold">{callerName}</span> đang gọi cho bạn...
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={handleDeclineCall}
                  className="flex-1 bg-red-500 text-white py-3 px-6 rounded-full font-semibold hover:bg-red-600 transition-colors duration-200"
                >
                  Từ chối
                </button>
                <button
                  onClick={handleAcceptCall}
                  className="flex-1 bg-green-500 text-white py-3 px-6 rounded-full font-semibold hover:bg-green-600 transition-colors duration-200"
                >
                  Nghe máy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- GIAO DIỆN CUỘC GỌI VIDEO --- */}
      {showActiveCall && activeCallId && (
        <div className="fixed inset-0 z-[9999]">
          <VideoCall
            callId={activeCallId}
            onCallEnd={handleCallEnd}
            isIncoming={true}
            otherUserId={callerName} // Pass caller name for reference
          />
        </div>
      )}
    </>
  );
}
