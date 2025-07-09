import type { Channel } from "./channel.type";
import type { User } from "./user.type";

export interface Message {
  id: string;
  content: string;
  user?: User;
  channel?: Channel;
  extra?: Record<string, any>;
  created_at: string;
  score?: number;
}

export type CreateMessageArgs = Omit<Message, "id" | "created_at" | "user" | "channel"> & {
  userId: string;
  channelId: string;
};
