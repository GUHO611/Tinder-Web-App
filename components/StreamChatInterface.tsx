"use client";

import { UserProfile } from "@/lib/actions/profile";
import {
  createOrGetChannel,
  createVideoCall,
  getStreamUserToken,
} from "@/lib/actions/stream";
import { useRouter } from "next/navigation";
import {
  RefObject,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Channel, Event, StreamChat, MessageResponse } from "stream-chat"; // Import MessageResponse

// --- 1. ĐỊNH NGHĨA CÁC INTERFACE ---

// Interface cho tin nhắn hiển thị ở Client
interface Message {
  id: string;
  text: string;
  sender: "me" | "other";
  timestamp: Date;
  user_id: string;
}

// Interface cho dữ liệu cuộc gọi đính kèm trong tin nhắn
// Kế thừa Record<string, unknown> để tương thích với kiểu dữ liệu của StreamChat
interface VideoCallCustomData extends Record<string, unknown> {
  call_id?: string;
  caller_id?: string;
  caller_name?: string;
  text?: string;
}

export default function StreamChatInterface({
  otherUser,
  ref,
  onCallStart,
}: {
  otherUser: UserProfile;
  ref: RefObject<{ handleVideoCall: () => void } | null>;
  onCallStart?: (callId: string) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const [client, setClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<Channel | null>(null);

  const [showScrollButton, setShowScrollButton] = useState<boolean>(false);

  // Video call states - now managed by GlobalCallManager



  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollButton(false);
  }

  function handleScroll() {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    }
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  useEffect(() => {

    async function initializeChat() {
      try {
        setError(null);

        const { token, userId, userName, userImage } =
          await getStreamUserToken();
        setCurrentUserId(userId!);

        const chatClient = StreamChat.getInstance(
          process.env.NEXT_PUBLIC_STREAM_API_KEY!
        );

        await chatClient.connectUser(
          {
            id: userId!,
            name: userName,
            image: userImage,
          },
          token
        );

        const { channelType, channelId } = await createOrGetChannel(
          otherUser.id
        );

        const chatChannel = chatClient.channel(channelType!, channelId);
        await chatChannel.watch();

        const state = await chatChannel.query({ messages: { limit: 50 } });

        const convertedMessages: Message[] = state.messages.map((msg) => ({
          id: msg.id,
          text: msg.text || "",
          sender: msg.user?.id === userId ? "me" : "other",
          timestamp: new Date(msg.created_at || new Date()),
          user_id: msg.user?.id || "",
        }));

        setMessages(convertedMessages);

        chatChannel.on("message.new", (event: Event) => {
          console.log("Received message:", event.message);
          if (event.message) {
            const messageText = event.message.text || "";
            const customData = event.message as unknown as VideoCallCustomData;
            
            // Handle "Call accepted" message - notify caller to enter room
            if (messageText.includes("📹 Call accepted") && event.message.user?.id !== userId) {
              console.log("Call accepted message received, notifying GlobalCallManager");
              if (window.globalCallManager?.handleOutgoingCallAccepted) {
                console.log("Calling handleOutgoingCallAccepted with callId:", customData.call_id);
                window.globalCallManager.handleOutgoingCallAccepted(customData.call_id);
              } else {
                console.log("handleOutgoingCallAccepted function not available");
              }
            }

            // Handle "Call declined" message - notify caller
            if (messageText.includes("📹 Call declined") && event.message.user?.id !== userId) {
              console.log("Call declined message received");
              if (window.globalCallManager?.handleOutgoingCallDeclined) {
                window.globalCallManager.handleOutgoingCallDeclined();
              }
            }
            
            // Handle regular messages (not from self)
            if (event.message.user?.id !== userId) {
              const newMsg: Message = {
                id: event.message.id,
                text: messageText,
                sender: "other",
                timestamp: new Date(event.message.created_at || new Date()),
                user_id: event.message.user?.id || "",
              };

              setMessages((prev) => {
                const messageExists = prev.some((msg) => msg.id === newMsg.id);
                if (!messageExists) {
                  return [...prev, newMsg];
                }

                return prev;
              });
            }
          }
        });

        chatChannel.on("typing.start", (event: Event) => {
          if (event.user?.id !== userId) {
            setIsTyping(true);
          }
        });

        chatChannel.on("typing.stop", (event: Event) => {
          if (event.user?.id !== userId) {
            setIsTyping(false);
          }
        });

        setClient(chatClient);
        setChannel(chatChannel);

        // Expose sendCallEndMessage and channel globally for GlobalCallManager
        window.sendCallEndMessage = async () => {
          if (chatChannel) {
            try {
              await chatChannel.sendMessage({
                text: "📹 Call ended",
              });
            } catch (error) {
              console.error("Error sending call end message:", error);
            }
          }
        };

        // Store current channel globally so GlobalCallManager can use it
        window.currentChatChannel = chatChannel;
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    if (otherUser) {
      initializeChat();
    }

    return () => {
      if (client) {
        client.disconnectUser();
      }
    };
  }, [otherUser]);

  async function handleVideoCall() {
    try {
      console.log("Starting video call with user:", otherUser.id);
      const { callId } = await createVideoCall(otherUser.id);
      console.log("Created call ID:", callId);

      if (!callId) {
        console.error("No call ID returned");
        return;
      }

      // Use GlobalCallManager to handle the outgoing call
      // Caller CHỈ hiện modal chờ, KHÔNG vào phòng call
      // Sẽ vào phòng khi receiver accept
      if (window.globalCallManager) {
        window.globalCallManager.initiateCall(callId, otherUser.full_name || "Người kia");
      }

      // Send call invitation message
      if (channel) {
        const messageData: VideoCallCustomData = {
          text: `📹 Video call invitation`,
          call_id: callId,
          caller_id: currentUserId,
          caller_name: otherUser.full_name || "Someone",
        };

        console.log("Sending call invitation message:", messageData);
        const sentMessage = await channel.sendMessage(messageData as unknown as Record<string, unknown>);
        console.log("Call invitation sent:", sentMessage);
      } else {
        console.error("No channel available to send call invitation");
      }
    } catch (error) {
      console.error("Error in handleVideoCall:", error);
    }
  }

  useImperativeHandle(ref, () => ({
    handleVideoCall,
  }));

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (newMessage.trim() && channel) {
      try {
        const response = await channel.sendMessage({
          text: newMessage.trim(),
        });

        const message: Message = {
          id: response.message.id,
          text: newMessage.trim(),
          sender: "me",
          timestamp: new Date(),
          user_id: currentUserId,
        };

        setMessages((prev) => {
          const messageExists = prev.some((msg) => msg.id === message.id);
          if (!messageExists) {
            return [...prev, message];
          }

          return prev;
        });

        setNewMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  }



  function formatTime(date: Date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  if (!client || !channel) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Đang thiết lập trò chuyện...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth chat-scrollbar relative"
        style={{ scrollBehavior: "smooth" }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"
              }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${message.sender === "me"
                ? "bg-gradient-to-r from-pink-500 to-red-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                }`}
            >
              <p className="text-sm">{message.text}</p>
              <p
                className={`text-xs mt-1 ${message.sender === "me"
                  ? "text-pink-100"
                  : "text-gray-500 dark:text-gray-400"
                  }`}
              >
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {showScrollButton && (
        <div className="absolute bottom-20 right-6 z-10">
          <button
            onClick={scrollToBottom}
            className="bg-pink-500 hover:bg-pink-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            title="Cuộn xuống cuối"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>
        </div>
      )}

      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <form className="flex space-x-2" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);

              if (channel && e.target.value.length > 0) {
                channel.keystroke();
              }
            }}
            onFocus={(e) => {
              if (channel) {
                channel.keystroke();
              }
            }}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            disabled={!channel}
          />

          <button
            type="submit"
            disabled={!newMessage.trim() || !channel}
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full hover:from-pink-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 12h14m-7-7l7 7-7 7"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
