import type { CreateMessageArgs, Message } from "../types/message.type";
import { IEnumerable, from } from "linq-to-typescript";

import BaseService from "./service";
import { PulseService } from "./pulse.service";

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
   * Create a new message
   */
  public async createMessage(args: CreateMessageArgs): Promise<Message> {
    const { data } = await this.post(`/v1/project/messages`, args);
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
   */
  public async deleteMessage(id: string): Promise<void> {
    await this.delete(`/v1/project/messages/${id}`);
    if (this.pulse) {
      await this.pulse.emit("message_delete", { id });
    }
  }
}
