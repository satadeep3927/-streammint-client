import { IEnumerable, from } from "linq-to-typescript";

import BaseService from "./service";
import ChannelService from "./channel.service";
import { Participant } from "../types/channel.type";
import { PulseService } from "./pulse.service";

/**
 * Service for managing participants in a channel.
 * This service extends the BaseService to provide methods for
 * retrieving, adding, removing, and updating participants in a specific channel.
 * * @remarks
 * - This service requires a connected ChannelService instance to function.
 * - It assumes that the ChannelService has a valid channelID set before performing operations.
 * * @example
 * ```typescript
 * const participantService = new ParticipantService(baseURL, secretID, secretKey, channelService);
 * // // Get participants of the current channel
 * participantService.getParticipants().then(participants => {
 *  console.log("Participants:", participants.toArray());
 * });
 * // // Add a new participant
 * const newParticipant: Participant = { user: { id: "user
 * 123", name: "John Doe" }, extra: { role: "admin" } };
 * participantService.addParticipant(newParticipant).then(() => {
 * console.log("Participant added successfully");
 * });
 *
 */
export default class ParticipantService extends BaseService {
  /**
   * Holds the ChannelService instance for channel-related operations
   * @protected
   * @type {ChannelService}
   */
  private channel: ChannelService;
  private pulse: PulseService;

  constructor(
    baseURL: string,
    secretID: string,
    secretKey: string,
    channelService: ChannelService,
    pulse: PulseService
  ) {
    super(baseURL, secretID, secretKey);
    this.channel = channelService;
    this.pulse = pulse;
  }
  /**
   * Get participants of a specific channel
   * @param channelID
   * @returns
   */
  public async getParticipants(): Promise<IEnumerable<Participant>> {
    if (!this.channel.channelID) {
      throw new Error(
        "Channel ID is not set. Please connect to a channel first."
      );
    }

    const channel = await this.channel.getChannel(this.channel.channelID!);
    if (!channel.participants) {
      return from([]);
    }
    return from(channel.participants);
  }

  /**
   * Add a participant to a specific channel
   * @param participant - Participant object to add
   * @returns Promise resolving to the updated channel object
   */
  public async addParticipant(participant: Participant): Promise<void> {
    if (!this.channel.channelID) {
      throw new Error(
        "Channel ID is not set. Please connect to a channel first."
      );
    }

    await this.post(
      `/v1/project/channels/${this.channel.channelID}/participants`,
      participant
    );
    if (this.pulse) {
      await this.pulse.emit("participant_create", participant);
    }
  }

  /**
   * Remove a participant from a specific channel
   * @param participantID - ID of the participant to remove
   * @returns Promise resolving to the updated channel object
   */
  public async removeParticipant(participantID: string[]): Promise<void> {
    if (!this.channel.channelID) {
      throw new Error(
        "Channel ID is not set. Please connect to a channel first."
      );
    }
    await this.delete(
      `/v1/project/channels/${this.channel.channelID}/participants`,
      {
        data: participantID,
      }
    );
    if (this.pulse) {
      for (const id of participantID) {
        await this.pulse.emit("participant_delete", { id });
      }
    }
  }

  /**
   * Update Participant
   * @param participant - participant to update
   * @returns Promise resolving to the updated participant object
   */
  public async updateParticipant(participant: Participant): Promise<void> {
    if (!this.channel.channelID) {
      throw new Error(
        "Channel ID is not set. Please connect to a channel first."
      );
    }

    await this.put(
      `/v1/project/channels/${this.channel.channelID}/participants`,
      participant
    );
    if (this.pulse) {
      await this.pulse.emit("participant_update", participant);
    }
  }
}
