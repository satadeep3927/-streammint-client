import { PulseEventFN, PulseEventListener } from "../types/pulse.type";

import BaseService from "./service";
import { getWebSocketFromHttpUrl } from "../lib/utils";
import { v7 as uuid } from "uuid";

/**
 * Service for managing real-time pulse events over WebSocket.
 *
 * Extends {@link BaseService} to provide authenticated WebSocket communication,
 * event subscription, and event emission capabilities.
 *
 * @remarks
 * - Each instance generates a unique client ID and authentication token.
 * - Listeners can be registered for specific event types.
 * - Events can be emitted to the server with arbitrary data payloads.
 *
 * @example
 * ```typescript
 * const pulse = new PulseService(baseURL, secretID, secretKey);
 * pulse.on('update', (data) => { console.log(data); });
 * pulse.emit('ping', { foo: 'bar' });
 * ```
 */
export class PulseService extends BaseService {
  private uri: string;
  private clientID: string;
  private token: string;
  private listeners: Set<PulseEventListener> = new Set();
  private ws: WebSocket | null = null;
  private connectionPromise: Promise<void> | null = null;

  constructor(baseURL: string, secretID: string, secretKey: string) {
    super(baseURL, secretID, secretKey);
    this.clientID = uuid();
    this.token = this.generateToken(secretID, secretKey, 14600);
    this.uri = `${getWebSocketFromHttpUrl(baseURL)}/v1/pulse/${
      this.clientID
    }/ws?token=${this.token}`;
    // ✅ Don't connect in constructor
  }

  /**
   * Ensures WebSocket connection is established
   * @returns Promise that resolves when connected
   */
  private async ensureConnection(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = this.connect();
    return this.connectionPromise;
  }

  public async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.uri);

      this.ws.onopen = () => {
        console.log("[PulseService] Connected");
        this.connectionPromise = null;
        resolve();
      };

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data);
          if (message.sender_id === this.clientID) return;

          this.listeners.forEach((listener) => {
            if (listener.event === message.event_type) {
              listener.fn(message);
            }
          });
        } catch (error) {
          console.error("[PulseService] Message parse error:", error);
        }
      };

      this.ws.onerror = (error) => {
        console.error("[PulseService] WebSocket error:", error);
        this.connectionPromise = null;
        reject(error);
      };

      this.ws.onclose = () => {
        console.log("[PulseService] Connection closed");
        this.ws = null;
        this.connectionPromise = null;
      };
    });
  }

  /**
   * Auto-connecting emit - connects if needed
   */
  public async emit(
    event: string,
    data: Record<string, any> = {}
  ): Promise<void> {
    await this.ensureConnection();

    const payload = {
      id: uuid(),
      event_type: event,
      data,
      sender_id: this.clientID,
    };

    this.ws!.send(JSON.stringify(payload));
  }

  /**
   * Listeners can be added before connection
   */
  public on(event: string, listener: PulseEventFN): void {
    this.listeners.add({ event, fn: listener });
  }

  public off(event: string, listener: PulseEventFN): void {
    this.listeners.forEach((l) => {
      if (l.event === event && l.fn === listener) {
        this.listeners.delete(l);
      }
    });
  }

  /**
   * Get connection status
   */
  public get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Disconnect
   */
  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connectionPromise = null;
  }
}
