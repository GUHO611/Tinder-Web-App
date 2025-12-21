// lib/stream-chat-client.ts
import { StreamChat } from "stream-chat";
import { getStreamUserToken } from "@/lib/actions/stream";

let globalClient: StreamChat | null = null;

export async function getGlobalStreamClient(): Promise<StreamChat> {
  if (globalClient && globalClient.userID) {
    return globalClient;
  }

  const { token, userId, userName, userImage } = await getStreamUserToken();

  globalClient = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_API_KEY!);

  await globalClient.connectUser(
    {
      id: userId!,
      name: userName || userId,
      image: userImage,
    },
    token
  );

  return globalClient;
}