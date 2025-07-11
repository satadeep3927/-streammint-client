import type { CreateMessageArgs, Message } from "../types/message.type";
import { IEnumerable, from } from "linq-to-typescript";

import BaseService from "./service";
import { PulseService } from "./pulse.service";

/**
 * Pagination options for getting messages before/after a specific time
 */
export interface MessagePaginationOptions {
  /** The datetime to use as a reference point (ISO string or Date) */
  datetime?: string | Date;
  /** Maximum number of messages to return (default: 100) */
  limit?: number;
}

/**
 * Search options for searching messages in a channel
 */
export interface MessageSearchOptions {
  /** The search query string */
  query: string;
}

/**
 * MessageService provides CRUD operations for messages and emits real-time events via PulseService.
 * 
 * Standard events: "message_create", "message_update", "message_delete".
 * 
 * ---
 * ## Custom Events
 * 
 * You can send and listen to custom events using the underlying PulseService:
 *
 * @example
 * // Listen for a custom event
 * messageService.onCustomEvent("my_custom_event", (data) => {
 *   console.log("Received custom event:", data);
 * });
 *
 * // Emit a custom event
 * messageService.emitCustomEvent("my_custom_event", { foo: "bar" });
 *
 * // Or use the underlying pulse directly:
 * messageService.pulse.on("my_custom_event", handler);
 * messageService.pulse.emit("my_custom_event", { ... });
 *
 * ---
 */

export class MessageService extends BaseService {
  /**
   * The underlying PulseService instance for real-time events and custom event support.
   */
  public pulse: PulseService;

  constructor(baseURL: string, secretID: string, secretKey: string, pulse: PulseService) {
    super(baseURL, secretID, secretKey);
    this.pulse = pulse;
  }

  /**
   * Listen for a custom event (shortcut for this.pulse.on)
   * @param event - Custom event name
   * @param handler - Handler function
   */
  public onCustomEvent(event: string, handler: (data: any) => void): void {
    this.pulse.on(event, handler);
  }

  /**
   * Emit a custom event (shortcut for this.pulse.emit)
   * @param event - Custom event name
   * @param data - Event payload
   */
  public async emitCustomEvent(event: string, data: Record<string, any>): Promise<void> {
    await this.pulse.emit(event, data);
  }

  /**
   * Get messages for a channel
   */
  public async getMessages(channelId: string): Promise<IEnumerable<Message>> {
    const { data } = await this.get(`/v1/project/messages/${channelId}`);
    return from(data.data);
  }

  /**
   * Get messages after a specific datetime (for pagination)
   * @param channelId - The channel ID
   * @param options - Pagination options
   */
  public async getMessagesAfter(channelId: string, options: MessagePaginationOptions = {}): Promise<IEnumerable<Message>> {
    const params = new URLSearchParams();
    
    if (options.datetime) {
      const datetime = options.datetime instanceof Date ? options.datetime.toISOString() : options.datetime;
      params.append('datetime', datetime);
    }
    
    if (options.limit !== undefined) {
      params.append('limit', options.limit.toString());
    }

    const queryString = params.toString();
    const url = `/v1/project/messages/${channelId}/after${queryString ? `?${queryString}` : ''}`;
    
    const { data } = await this.get(url);
    return from(data.data);
  }

  /**
   * Get messages before a specific datetime (for pagination)
   * @param channelId - The channel ID
   * @param options - Pagination options
   */
  public async getMessagesBefore(channelId: string, options: MessagePaginationOptions = {}): Promise<IEnumerable<Message>> {
    const params = new URLSearchParams();
    
    if (options.datetime) {
      const datetime = options.datetime instanceof Date ? options.datetime.toISOString() : options.datetime;
      params.append('datetime', datetime);
    }
    
    if (options.limit !== undefined) {
      params.append('limit', options.limit.toString());
    }

    const queryString = params.toString();
    const url = `/v1/project/messages/${channelId}/before${queryString ? `?${queryString}` : ''}`;
    
    const { data } = await this.get(url);
    return from(data.data);
  }

  /**
   * Search messages in a channel
   * @param channelId - The channel ID
   * @param options - Search options
   */
  public async searchMessages(channelId: string, options: MessageSearchOptions): Promise<IEnumerable<Message>> {
    const params = new URLSearchParams();
    params.append('query', options.query);
    
    const { data } = await this.get(`/v1/project/messages/${channelId}/search?${params.toString()}`);
    return from(data.data);
  }

  /**
   * Create a new message
   */
  public async createMessage(args: CreateMessageArgs): Promise<Message> {
    const { data } = await this.post(`/v1/project/messages/${args.channelId}`, args);
    if (this.pulse) {
      await this.pulse.emit("message_create", data.data);
    }
    return data.data;
  }

  /**
   * Update a message
   * @param channelId - The channel ID the message belongs to
   * @param message - The full message object (must include id, content, user, created_at, etc.)
   */
  public async updateMessage(channelId: string, message: Message): Promise<Message> {
    const { data } = await this.put(`/v1/project/messages/${channelId}/${message.id}`, message);
    if (this.pulse) {
      await this.pulse.emit("message_update", data.data);
    }
    return data.data;
  }

  /**
   * Delete a message
   * @param channelId - The channel ID the message belongs to
   * @param messageId - The message ID to delete
   */
  public async deleteMessage(channelId: string, messageId: string): Promise<void> {
    await this.delete(`/v1/project/messages/${channelId}/${messageId}`);
    if (this.pulse) {
      await this.pulse.emit("message_delete", { id: messageId, channelId });
    }
  }
}
