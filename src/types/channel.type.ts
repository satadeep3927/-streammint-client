import { User } from "./user.type";

/**
 * Represents a participant in a channel.
 * A participant can be a user with additional metadata.
 * The `extra` field can be used to store any additional information about the participant.
 * The `user` field is optional and can be used to reference a user object.
 * If the `user` field is not provided, the participant is considered anonymous.
 */
export interface Participant {
  extra?: Record<string, any>;
  user?: User;
}
/**
 * Represents a channel in the system.
 * A channel is identified by a unique ID and has a name.
 * The `extra` field can be used to store any additional metadata about the channel.
 * The `participants` field is an optional array of participants in the channel.
 * The `created_at` field indicates when the channel was created.
 * The `created_at` field is a string in ISO 8601 format.
 */
export interface Channel {
  id: string;
  name: string;
  extra?: Record<string, any>;
  participants?: Participant[];
  created_at: string;
}

export type CraeteChannelArgs = Omit<Channel, "id" | "created_at">;

export type UpdateChannelArgs = Omit<
  Channel,
  "id" | "created_at" | "participants"
>;
