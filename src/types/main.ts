/**
 *  This file is part of the Stream Client library.
 *  It defines the configuration interface for the Stream Client.
 *  The Stream Client is used to connect to a WebSocket server for real-time data streaming
 */

export interface StreamClientOptions {
  secretID: string; // Unique identifier for the client, used for authentication
  secretKey: string; // Secret key for authentication with the server
  url: string; // The WebSocket URL to connect to
  reconnectInterval?: number; // Interval in milliseconds for reconnection attempts
  maxReconnectAttempts?: number; // Maximum number of reconnection attempts before giving up
  autoConnect?: boolean; // Whether to automatically connect on instantiation
}

export type URLBuilder = {
  [key: string]: (...args: any[]) => string;
};

export type RecordID = string;
