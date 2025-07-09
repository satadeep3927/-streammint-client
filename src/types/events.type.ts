import type { Channel } from "./channel.type";
import type { FileObject } from "./file.type";
import type { Message } from "./message.type";
import type { Participant } from "./channel.type";
import type { User } from "./user.type";

export type StreamEvent =
    { type: "participant_create"; data: Participant }
  | { type: "participant_update"; data: Participant }
  | { type: "participant_delete"; data: { id: string } }
  | { type: "channel_create"; data: Channel }
  | { type: "channel_update"; data: Channel }
  | { type: "channel_delete"; data: { id: string } }
  | { type: "user_create"; data: User }
  | { type: "user_update"; data: User }
  | { type: "user_delete"; data: { id: string } }
  | { type: "file_upload"; data: FileObject }
  | { type: "file_delete"; data: { id: string } }
  | { type: "message_create"; data: Message }
  | { type: "message_update"; data: Message }
  | { type: "message_delete"; data: { id: string } };
