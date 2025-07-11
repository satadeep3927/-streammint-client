import EventEmitter from "eventemitter3";
import { FileService } from "../services/file.service";
import { MessageService } from "../services/message.service";
import { PulseService } from "../services/pulse.service";
import { StreamClientOptions } from "../types/main";
import { StreamEvent } from "../types/events.type";
import UserService from "../services/user.service";

export class StreamClient extends EventEmitter {
  private url: string;
  private reconnectInterval: number;
  private maxReconnectAttempts: number;
  private autoConnect: boolean;
  private secretID: string;
  private secretKey: string;
  public users: UserService;
  public files: FileService;
  public messages: MessageService;
  public pulse: PulseService;
  public isReady: boolean = false;
  private userId?: string;

  constructor({
    url,
    secretID = "",
    secretKey = "",
    reconnectInterval = 5000,
    maxReconnectAttempts = 10,
    autoConnect = true,
  }: StreamClientOptions) {
    super();
    this.url = url;
    this.reconnectInterval = reconnectInterval;
    this.maxReconnectAttempts = maxReconnectAttempts;
    this.autoConnect = autoConnect;
    this.secretID = secretID;
    this.secretKey = secretKey;
    this.pulse = new PulseService(this.url, this.secretID, this.secretKey);
    this.users = new UserService(
      this.url,
      this.secretID,
      this.secretKey,
      this.pulse
    );
    this.files = new FileService(
      this.url,
      this.secretID,
      this.secretKey,
      this.pulse
    );
    this.messages = new MessageService(
      this.url,
      this.secretID,
      this.secretKey,
      this.pulse
    );
    
    // Only auto-connect if enabled
    if (this.autoConnect) {
      this.connect().catch(() => {
        // Silently ignore connection failures in constructor
        // The connection will be retried based on reconnect settings
      });
    }
  }
  /**
   * Login with a userId for presence/typing events. Must be called before connect().
   */
  public login(userId: string): void {
    this.userId = userId;
  }

  /**
   * Disconnect from the real-time WebSocket
   */
  public disconnect(): void {
    this.pulse.disconnect();
    this.isReady = false;
    this.emit("connection:close");
  }

  /**
   * Returns true if the WebSocket is connected
   */
  public isConnected(): boolean {
    return this.pulse.isConnected;
  }

  /**
   * Returns the current connection state as a string
   * ('connected' | 'disconnected')
   */
  public getConnectionState(): "connected" | "disconnected" {
    return this.pulse.isConnected ? "connected" : "disconnected";
  }

  /**
   * Send a typing indicator to a channel
   */
  public async sendTyping(channelId: string, isTyping: boolean): Promise<void> {
    await this.pulse.emit("typing", { channelId, isTyping });
  }

  /**
   * Send a presence update (e.g., 'online', 'away', 'offline')
   */
  public async sendPresence(status: string): Promise<void> {
    await this.pulse.emit("presence", { status });
  }

  /**
   * Listen for typing events
   */
  public onTyping(
    handler: (data: {
      channelId: string;
      userId: string;
      isTyping: boolean;
    }) => void
  ): void {
    this.pulse.on("typing", (args) =>
      handler(args as { channelId: string; userId: string; isTyping: boolean })
    );
  }

  /**
   * Listen for presence events
   */
  public onPresence(
    handler: (data: { userId: string; status: string }) => void
  ): void {
    this.pulse.on("presence", (args) =>
      handler(args as { userId: string; status: string })
    );
  }
  /**
   * Typed event: message_create
   */
  public onMessageCreate(
    handler: (event: Extract<StreamEvent, { type: "message_create" }>) => void
  ) {
    this.pulse.onEvent("message_create", handler);
  }

  /**
   * Typed event: message_update
   */
  public onMessageUpdate(
    handler: (event: Extract<StreamEvent, { type: "message_update" }>) => void
  ) {
    this.pulse.onEvent("message_update", handler);
  }

  /**
   * Typed event: message_delete
   */
  public onMessageDelete(
    handler: (event: Extract<StreamEvent, { type: "message_delete" }>) => void
  ) {
    this.pulse.onEvent("message_delete", handler);
  }

  /**
   * Typed event: participant_create
   */
  public onParticipantCreate(
    handler: (
      event: Extract<StreamEvent, { type: "participant_create" }>
    ) => void
  ) {
    this.pulse.onEvent("participant_create", handler);
  }

  /**
   * Typed event: participant_update
   */
  public onParticipantUpdate(
    handler: (
      event: Extract<StreamEvent, { type: "participant_update" }>
    ) => void
  ) {
    this.pulse.onEvent("participant_update", handler);
  }

  /**
   * Typed event: participant_delete
   */
  public onParticipantDelete(
    handler: (
      event: Extract<StreamEvent, { type: "participant_delete" }>
    ) => void
  ) {
    this.pulse.onEvent("participant_delete", handler);
  }

  /**
   * Typed event: channel_create
   */
  public onChannelCreate(
    handler: (event: Extract<StreamEvent, { type: "channel_create" }>) => void
  ) {
    this.pulse.onEvent("channel_create", handler);
  }

  /**
   * Typed event: channel_update
   */
  public onChannelUpdate(
    handler: (event: Extract<StreamEvent, { type: "channel_update" }>) => void
  ) {
    this.pulse.onEvent("channel_update", handler);
  }

  /**
   * Typed event: channel_delete
   */
  public onChannelDelete(
    handler: (event: Extract<StreamEvent, { type: "channel_delete" }>) => void
  ) {
    this.pulse.onEvent("channel_delete", handler);
  }

  /**
   * Typed event: user_create
   */
  public onUserCreate(
    handler: (event: Extract<StreamEvent, { type: "user_create" }>) => void
  ) {
    this.pulse.onEvent("user_create", handler);
  }

  /**
   * Typed event: user_update
   */
  public onUserUpdate(
    handler: (event: Extract<StreamEvent, { type: "user_update" }>) => void
  ) {
    this.pulse.onEvent("user_update", handler);
  }

  /**
   * Typed event: user_delete
   */
  public onUserDelete(
    handler: (event: Extract<StreamEvent, { type: "user_delete" }>) => void
  ) {
    this.pulse.onEvent("user_delete", handler);
  }

  /**
   * Typed event: file_upload
   */
  public onFileUpload(
    handler: (event: Extract<StreamEvent, { type: "file_upload" }>) => void
  ) {
    this.pulse.onEvent("file_upload", handler);
  }

  /**
   * Typed event: file_delete
   */
  public onFileDelete(
    handler: (event: Extract<StreamEvent, { type: "file_delete" }>) => void
  ) {
    this.pulse.onEvent("file_delete", handler);
  }

  public async connect() {
    if (!this.userId) {
      throw new Error("User ID must be set before connecting");
    }
    try {
      await this.pulse.connect(this.userId);

      this.isReady = true;

      this.emit("ready");
    } catch (error) {
      this.isReady = false;

      this.emit("error", error);

      if (this.autoConnect) {
        this.maxReconnectAttempts--;

        if (this.maxReconnectAttempts > 0) {
          setTimeout(() => this.connect(), this.reconnectInterval);
        } else {
          this.emit("maxReconnectAttemptsReached", {
            message: "Max reconnect attempts reached",
            error,
          });
        }
      } else {
        console.error("Failed to connect:", error);
      }
    }
  }
}
