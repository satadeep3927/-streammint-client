import EventEmitter from "eventemitter3";
import { FileService } from "../services/file.service";
import { PulseService } from "../services/pulse.service";
import { StreamClientOptions } from "../types/main";
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
  public pulse: PulseService;
  public isReady: boolean = false;
  /**
   * StreamClient is a WebSocket client for connecting to a streaming server.
   * It extends the native WebSocket class to provide additional functionality.
   *
   * @param config - Configuration options for the StreamClient
   */
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
    this.users = new UserService(this.url, this.secretID, this.secretKey);
    this.files = new FileService(this.url, this.secretID, this.secretKey);
    this.pulse = new PulseService(this.url, this.secretID, this.secretKey);

    /**
     *  Initializes the StreamClient and connects to the WebSocket server.
     *  If autoConnect is true, it will attempt to connect immediately.
     *  If the connection fails, it will retry based on the reconnectInterval and maxReconnect
     */
    this.connect();
  }

  // Example method to demonstrate functionality
  private async connect() {
    try {
      await this.pulse.connect();

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
