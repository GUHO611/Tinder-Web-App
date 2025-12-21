"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getGlobalStreamClient } from "@/lib/stream-chat-client";
import { Channel } from "stream-chat";
import { useAuth } from "./auth-context";

// Helper function to generate channel ID (same logic as in stream.ts)
function generateChannelId(userId1: string, userId2: string): string {
  const sortedIds = [userId1, userId2].sort();
  const combinedIds = sortedIds.join("_");
  let hash = 0;
  for (let i = 0; i < combinedIds.length; i++) {
    const char = combinedIds.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `match_${Math.abs(hash).toString(36)}`;
}

interface MessageContextType {
  unreadCount: number;
  unreadByChannel: Record<string, number>;
  markAsRead: (channelId: string) => void;
  refreshUnreadCount: () => Promise<void>;
  user: any;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export function MessageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadByChannel, setUnreadByChannel] = useState<Record<string, number>>({});

  const markAsRead = async (channelId: string) => {
    try {
      const client = await getGlobalStreamClient();
      if (!client) return;

      const channel = client.channel('messaging', channelId);
      await channel.markRead();

      // Update local state
      setUnreadByChannel(prev => {
        const newUnread = { ...prev };
        delete newUnread[channelId];
        const totalUnread = Object.values(newUnread).reduce((sum, count) => sum + count, 0);
        setUnreadCount(totalUnread);
        return newUnread;
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const refreshUnreadCount = async () => {
    if (!user) return;

    try {
      const client = await getGlobalStreamClient();
      if (!client) return;

      // Get all channels
      const filter = { type: 'messaging', members: { $in: [user.id] } };
      const sort = { last_message_at: -1 };
      const options = { limit: 100 };
      const channels = await client.queryChannels(filter as any, sort as any, options);

      let totalUnread = 0;
      const unreadMap: Record<string, number> = {};

      for (const channel of channels) {
        if (channel && channel.id) {
          const unread = channel.countUnread();
          if (unread > 0) {
            unreadMap[channel.id] = unread;
            totalUnread += unread;
          }
        }
      }

      setUnreadByChannel(unreadMap);
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error('Error refreshing unread count:', error);
    }
  };

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setUnreadByChannel({});
      return;
    }

    // Initial load
    refreshUnreadCount();

    // Set up real-time updates
    let client: any = null;
    let subscription: any = null;

    const setupRealtime = async () => {
      try {
        client = await getGlobalStreamClient();
        if (!client) return;

        // Listen for new messages (notifications)
        client.on('notification.message_new', async (event: any) => {
          await refreshUnreadCount();
        });

        // Listen for message.new events (when user is in channel)
        client.on('message.new', async (event: any) => {
          // Only refresh if the message is not from the current user
          if (event.message?.user?.id !== user.id) {
            await refreshUnreadCount();
          }
        });

        // Listen for message read events
        client.on('message.read', async (event: any) => {
          await refreshUnreadCount();
        });

        // Also listen for channel updates that might affect unread counts
        client.on('notification.channel_updated', async () => {
          await refreshUnreadCount();
        });

        // Periodic refresh as fallback (every 30 seconds)
        const intervalId = setInterval(() => {
          refreshUnreadCount();
        }, 30000);

        // Store interval ID for cleanup
        (client as any)._intervalId = intervalId;

      } catch (error) {
        console.error('Error setting up message notifications:', error);
      }
    };

    setupRealtime();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      if (client) {
        client.off('notification.message_new');
        client.off('message.new');
        client.off('message.read');
        client.off('notification.channel_updated');

        // Clear the periodic refresh interval
        if ((client as any)._intervalId) {
          clearInterval((client as any)._intervalId);
        }
      }
    };
  }, [user]);

  return (
    <MessageContext.Provider
      value={{
        unreadCount,
        unreadByChannel,
        markAsRead,
        refreshUnreadCount,
        user,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
}

export function useMessage() {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error("useMessage must be used within a MessageProvider");
  }
  return context;
}
