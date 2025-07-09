# StreamMint TypeScript Client

A TypeScript client library for connecting to StreamMint chat server with real-time WebSocket support.

## Features

- 🔐 JWT Authentication
- 🚀 Real-time WebSocket communication
- 📡 Event forwarding system
- 🎯 TypeScript support with full type safety
- 🌐 Browser and Node.js compatible
- 📦 ESM and CommonJS support
- ⚡ Automatic reconnection with exponential backoff
- 🛡️ Comprehensive error handling

## Installation

```bash
npm install @streammint/client
```

## Quick Start

```typescript
import { StreamMintClient } from '@streammint/client';

const client = new StreamMintClient({
  baseUrl: 'http://localhost:3000',
  wsUrl: 'ws://localhost:3000', // Optional, defaults to baseUrl with ws protocol
});

// Authentication
await client.login({
  email: 'user@example.com',
  password: 'password123'
});

// Connect to WebSocket
client.connect();

// Listen for messages
client.onMessage((data) => {
  console.log('New message:', data.message);
});

// Send a message
client.sendMessage('channel-id', 'Hello, World!');
```

## API Reference

### Client Configuration

```typescript
interface ClientConfig {
  baseUrl: string;          // HTTP API base URL
  wsUrl?: string;          // WebSocket URL (optional)
  timeout?: number;        // Request timeout in ms (default: 10000)
  retryAttempts?: number;  // WebSocket retry attempts (default: 5)
  retryDelay?: number;     // Initial retry delay in ms (default: 1000)
}
```

### Authentication Methods

```typescript
// Register new organization
await client.register({
  name: 'My Organization',
  email: 'admin@myorg.com',
  password: 'securePassword'
});

// Login
const response = await client.login({
  email: 'admin@myorg.com',
  password: 'securePassword'
});

// Get user profile
const profile = await client.getProfile();

// Logout
client.logout();
```

### WebSocket Connection

```typescript
// Connect (requires authentication first)
client.connect();

// Check connection state
const isConnected = client.isConnected();
const state = client.getConnectionState(); // 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error'

// Disconnect
client.disconnect();
```
### Real-time Events

```typescript
// ---
// Custom Events (Universal)
// ---

// Listen for a custom event
client.messageService.onCustomEvent("my_custom_event", (data) => {
  console.log("Received custom event:", data);
});

// Emit a custom event
await client.messageService.emitCustomEvent("my_custom_event", { foo: "bar" });

// Or use the underlying pulse directly:
client.messageService.pulse.on("my_custom_event", handler);
await client.messageService.pulse.emit("my_custom_event", { ... });

// ---
// Standard events
// ---

// Send messages
client.sendMessage('channel-id', 'Hello!');

// Send typing indicators
client.sendTyping('channel-id', true);

// Send presence updates
client.sendPresence('online');

// Listen for specific events
client.onMessage((data) => {
  console.log(`Message in ${data.channel_id}: ${data.message}`);
});

```
client.onTyping((data) => {
  console.log(`${data.sender_id} is ${data.is_typing ? 'typing' : 'not typing'}`);
});

client.onPresence((data) => {
  console.log(`${data.sender_id} is now ${data.status}`);
});

// Listen for raw events
client.on('pulse:event', (event) => {
  console.log('Received event:', event);
});
```

### Event Handling

```typescript
// Connection events
client.on('connection:state', (state) => console.log('State:', state));
client.on('connection:open', () => console.log('Connected'));
client.on('connection:close', (code, reason) => console.log('Disconnected'));
client.on('connection:error', (error) => console.error('Connection error:', error));

// Authentication events
client.on('auth:login', (data) => console.log('Logged in:', data));
client.on('auth:logout', () => console.log('Logged out'));
client.on('auth:error', (error) => console.error('Auth error:', error));

// Real-time events
client.on('pulse:event', (event) => console.log('Event:', event));
client.on('pulse:error', (error) => console.error('Event error:', error));
```

## Development

### Setup

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Watch mode for development
npm run dev

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type check
npm run type-check
```

### Project Structure

```
src/
├── index.ts          # Main exports
├── client.ts         # Main client class
├── auth.ts          # Authentication service
├── websocket.ts     # WebSocket manager
├── types.ts         # TypeScript interfaces
└── test/
    └── setup.ts     # Test setup and mocks
```

## Browser Support

- Chrome/Chromium 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Node.js Support

- Node.js 16+

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
