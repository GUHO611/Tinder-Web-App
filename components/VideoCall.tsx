"use client";

import { useEffect, useState, memo, useMemo } from "react";
import {
  Call,
  CallControls,
  PaginatedGridLayout,
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import { getStreamVideoToken } from "@/lib/actions/stream";

// Use useMemo to prevent infinite re-renders of PaginatedGridLayout

interface VideoCallProps {
  callId: string;
  onCallEnd: () => void;
  isIncoming?: boolean;
  otherUserId?: string;
  showWaitingForParticipant?: boolean;
}

export default function VideoCall({
  callId,
  onCallEnd,
  isIncoming = false,
  showWaitingForParticipant = false,
}: VideoCallProps) {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [showCallEnded, setShowCallEnded] = useState(false);
  const [userInitiatedLeave, setUserInitiatedLeave] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);

  // Memoize PaginatedGridLayout to prevent infinite re-renders
  const gridLayout = useMemo(() => <PaginatedGridLayout />, []);

  useEffect(() => {
    let isMounted = true;

    async function initializeVideoCall() {
      if (hasJoined) return;

      try {
        setError(null);
        // setLoading(true); // Có thể bật lại nếu muốn hiện loading mỗi lần

        const { token, userId, userName, userImage } = await getStreamVideoToken();

        if (!isMounted) return;

        const videoClient = new StreamVideoClient({
          apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
          user: {
            id: userId!,
            name: userName,
            image: userImage,
          },
          token,
        });

        if (!isMounted) return;

        const videoCall = videoClient.call("default", callId);

        // Luôn dùng create: true để đảm bảo call tồn tại
        await videoCall.join({ create: true });

        // Tự động bật cam/mic
        try {
          await videoCall.camera.enable();
          await videoCall.microphone.enable();
        } catch (e) {
          console.warn("Không thể bật camera/mic tự động:", e);
        }

        if (!isMounted) return;

        setClient(videoClient);
        setCall(videoCall);
        setHasJoined(true);

        // Listen for call state changes to detect when call ends
        const callStateUnsubscribe = videoCall.state.callingState$.subscribe((callingState) => {
          console.log('Call state changed:', callingState);

          // When call ends (left the call)
          if (callingState === 'left' && !showCallEnded) {
            console.log('Call ended, checking participants...');
            // Small delay to let participant list update
            setTimeout(() => {
              const participants = videoCall.state.participants;
              console.log('Participants after call end:', participants.length);
              if (participants.length <= 1) {
                console.log('Call ended by other participant or server');
                setShowCallEnded(true);
                // Don't auto-end - let user manually close when ready
              }
            }, 500);
          }
        });

        // Also listen for participant count changes as backup
        let participantCount = 0;
        const participantUnsubscribe = videoCall.state.participants$.subscribe((participants) => {
          console.log('Participants updated:', participants.length, 'previous:', participantCount);

          // Update participant count state
          setParticipantCount(participants.length);

          // If we had 2 participants and now have 1, and we didn't leave, show notification
          if (participantCount >= 2 && participants.length === 1 && !showCallEnded) {
            console.log('Other participant left the call');
            setShowCallEnded(true);
            // Remove auto-end - let user manually close when ready
          }

          participantCount = participants.length;
        });

        // Store unsubscribe functions for cleanup
        (videoCall as any)._callStateUnsubscribe = callStateUnsubscribe;
        (videoCall as any)._participantUnsubscribe = participantUnsubscribe;
      } catch (error) {
        console.error("Video call error:", error);
        setError("Không thể kết nối video call");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initializeVideoCall();

    return () => {
      isMounted = false;
      if (call) {
        // Cleanup subscriptions with type checking
        if ((call as any)._callStateUnsubscribe && typeof (call as any)._callStateUnsubscribe === 'function') {
          (call as any)._callStateUnsubscribe();
        }
        if ((call as any)._participantUnsubscribe && typeof (call as any)._participantUnsubscribe === 'function') {
          (call as any)._participantUnsubscribe();
        }
        call.leave();
      }
      if (client) {
        client.disconnectUser();
      }
    };
  }, [callId, hasJoined]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-lg">Đang kết nối...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center text-white max-w-md mx-auto p-8 bg-gray-900 rounded-2xl border border-gray-800">
          <h3 className="text-xl font-semibold mb-2 text-red-500">Lỗi cuộc gọi</h3>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={onCallEnd}
            className="bg-gray-700 text-white font-semibold py-2 px-6 rounded-full hover:bg-gray-600 transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  if (!client || !call) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
      {/* Custom CSS to keep only microphone, camera, and hang up buttons */}
      <style jsx>{`
        .str-video__call-controls button:not([data-testid*="microphone"]):not([data-testid*="camera"]):not([data-testid*="leave"]):not([data-testid*="hang-up"]):not([aria-label*="Microphone"]):not([aria-label*="Camera"]):not([aria-label*="Leave"]):not([aria-label*="Hang up"]):not([title*="Microphone"]):not([title*="Camera"]):not([title*="Leave"]):not([title*="Hang up"]) {
          display: none !important;
        }
      `}</style>

      <StreamVideo client={client}>
        <StreamCall call={call}>
          <StreamTheme>
            {/* Sử dụng PaginatedGridLayout để chia đều màn hình cho cả 2 người tham gia */}
            {gridLayout}

            <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
              <CallControls onLeave={onCallEnd} />
            </div>
          </StreamTheme>
        </StreamCall>
      </StreamVideo>

      {/* Waiting for other participant - only show for callers waiting after acceptance */}
      {showWaitingForParticipant && participantCount < 2 && !showCallEnded && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[60]">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-sm mx-4 shadow-2xl text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Đang chờ người tham gia
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Vui lòng đợi trong giây lát...
            </p>
            <div className="flex space-x-2 justify-center mb-4">
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Call Ended Notification */}
      {showCallEnded && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[60]">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-sm mx-4 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l-8 8m0-8l8 8M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Cuộc gọi đã kết thúc
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Người kia đã rời khỏi cuộc gọi
            </p>
            <button
              onClick={onCallEnd}
              className="bg-gray-700 text-white font-semibold py-2 px-6 rounded-full hover:bg-gray-600 transition-all"
            >
              Trở lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
