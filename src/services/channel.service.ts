import { Channel, CraeteChannelArgs } from "../types/channel.type";
import { IEnumerable, from } from "linq-to-typescript";

import BaseService from "./service";
import ParticipantService from "./participant.service";

/**
 * Service for managing channels in the system.
 * Provides methods to create, update, delete, and retrieve channels.
 *
 * @remarks
 * This service extends {@link BaseService} to provide authenticated HTTP communication
 * with the backend API for channel management.
 *
 * @example
 * ```typescript
 * const channelService = new ChannelService(baseURL, secretID, secretKey);
 * const channels = await channelService.getChannels();
 * console.log(channels);
 * ```
 */

export default class ChannelService extends BaseService {
  /**
   * Holds the ParticipantService instance for participant-related operations
   * @public
   * @type {ParticipantService}
   */
  public participants: ParticipantService;

  /**
   * Holds the current channel ID for operations that require a specific channel context
   * @protected
   * @type {string | null}
   */
  public channelID: string | null = null;

  constructor(baseURL: string, secretID: string, secretKey: string) {
    super(baseURL, secretID, secretKey);

    this.participants = new ParticipantService(
      baseURL,
      secretID,
      secretKey,
      this
    );
  }

  /**
   * Get a list of channels
   * @returns Promise resolving to an array of channels
   */
  public async getChannels(): Promise<IEnumerable<Channel>> {
    const { data } = await this.get("/v1/project/channels");
    return from(data.data);
  }

  /**
   * Get a specific channel by ID
   * @param id - Channel ID
   * @returns Promise resolving to the channel object
   */
  public async getChannel(id: string): Promise<Channel> {
    const { data } = await this.get(`/v1/project/channels/${id}`);
    return data.data as Channel;
  }

  /**
   * Get Channels by UserID
   * @param userID - User ID to filter channels
   * @returns Promise resolving to an array of channels
   */
  public async getChannelsByUserID(
    userID: string
  ): Promise<IEnumerable<Channel>> {
    const { data } = await this.get(
      `/v1/project/channels/participants/${userID}`
    );
    return from(data.data);
  }

  /**
   * Create Channel
   * @param channel - Channel object to create
   * @returns Promise resolving to the created channel object
   */
  public async createChannel(data: CraeteChannelArgs): Promise<Channel> {
    const { data: response } = await this.post("/v1/project/channels", {
      data,
    });
    return response.data as Channel;
  }

  /**
   * Update Channel
   * @param id - Channel ID to update
   * @param data - Updated channel data
   * @returns Promise resolving to the updated channel object
   */
  public async updateChannel(
    id: string,
    data: Partial<CraeteChannelArgs>
  ): Promise<Channel> {
    const { data: response } = await this.put(`/v1/project/channels/${id}`, {
      data,
    });
    return response.data as Channel;
  }

  /**
   * Delete Channel
   * @param id - Channel ID to delete
   * @returns Promise resolving to the deletion response
   */
  public async deleteChannel(id: string): Promise<void> {
    await this.delete(`/v1/project/channels/${id}`);
  }
  /**
   * Connect to Specific Channel
   * @param channelID - Channel ID to connect to
   * @returns Promise resolving to the connection response
   */
  public async connect(channelID: string): Promise<void> {
    this.channelID = channelID;
  }
}
