# StreamMint Client

A comprehensive TypeScript client library for StreamMint Server, providing real-time messaging, file management, user management, and WebSocket-based event streaming.

## Features

- 🚀 **Real-time messaging** with WebSocket support
- 👥 **User management** (CRUD operations)
- 📁 **File uploads** with support for Browser File API and React Native
- 🏢 **Channel management** with participant support
- 🔐 **Authentication** for organizations and projects
- 🎯 **Type-safe** with full TypeScript support
- 📡 **Event streaming** with PulseService
- 🔄 **Auto-reconnection** and error handling
- 🌐 **Cross-platform** (Browser, Node.js, React Native)

## Installation

```bash
npm install @streammint/client
```

## Quick Start

```typescript
import { StreamClient } from '@streammint/client';

// Initialize the client
const client = new StreamClient({
  url: 'http://your-streammint-server.com',
  secretID: 'your-secret-id',
  secretKey: 'your-secret-key',
  autoConnect: true
});

// Listen for connection events
client.on('ready', () => {
  console.log('Connected to StreamMint!');
});

// Access services
const users = await client.users.getUsers();
console.log('Users:', users.toArray());
```

## Services Overview

### 🔐 Authentication Service

```typescript
import { AuthService } from '@streammint/client';

const auth = new AuthService('http://your-server.com');

// Register organization
const org = await auth.registerOrganization({
  name: 'My Company',
  email: 'admin@company.com',
  password: 'secure-password'
});

// Login
const loginResult = await auth.loginOrganization({
  email: 'admin@company.com',
  password: 'secure-password'
});
```

### 📊 Project Service

```typescript
import { ProjectService } from '@streammint/client';

const projects = new ProjectService('http://your-server.com', 'jwt-token');

// Create project
const project = await projects.createProject({
  name: 'My Project',
  description: 'A sample project'
});

// Create API tokens
const token = await projects.createToken(project.id, {
  name: 'API Token'
});
```

### 👥 User Management

```typescript
// Get all users
const users = await client.users.getUsers();

// Create a user
const newUser = await client.users.createUser({
  name: 'John Doe',
  external_id: 'john.doe@company.com',
  extra: { role: 'admin' }
});

// Get user by ID
const user = await client.users.getUserByID('user-id');
```

### 💬 Messaging

```typescript
// Get messages for a channel
const messages = await client.messages.getMessages('channel-id');

// Create a message
const message = await client.messages.createMessage({
  content: 'Hello, World!',
  userId: 'user-id',
  channelId: 'channel-id'
});

// Search messages
const searchResults = await client.messages.searchMessages('channel-id', {
  query: 'hello'
});

// Pagination
const recentMessages = await client.messages.getMessagesAfter('channel-id', {
  datetime: '2023-01-01T00:00:00Z',
  limit: 50
});
```

### 🏢 Channel Management

```typescript
// Get all channels
const channels = await client.channels.getChannels();

// Create a channel
const channel = await client.channels.createChannel({
  name: 'General',
  extra: { description: 'General discussion' }
});

// Connect to a channel for participant operations
await client.channels.connect('channel-id');

// Add participants
await client.channels.participants.addParticipants([
  { user_id: 'user-1', extra: { role: 'admin' } },
  { user_id: 'user-2', extra: { role: 'member' } }
]);
```

### 📁 File Management

```typescript
// Upload files
const uploadedFile = await client.files.uploadFile([
  { file: fileObject, name: 'document.pdf' }
], { category: 'documents' });

// Get all files
const files = await client.files.getFiles();

// Upload to specific channel
const channelFile = await client.files.uploadChannelFile('channel-id', [
  { file: imageFile, name: 'screenshot.png' }
]);

// React Native support
const rnFile = FileService.createFileLike(
  'file:///path/to/file.jpg',
  'image/jpeg',
  'photo.jpg'
);
```

### 📡 Real-time Events (PulseService)

```typescript
// Listen for real-time events
client.pulse.on('message_create', (message) => {
  console.log('New message:', message);
});

client.pulse.on('user_update', (user) => {
  console.log('User updated:', user);
});

// Type-safe event handling
client.pulse.onEvent('message_create', (event) => {
  // event is fully typed
  console.log('Message from:', event.data.user);
});

// Emit custom events
await client.pulse.emit('custom_event', {
  foo: 'bar',
  timestamp: Date.now()
});
```

## Configuration Options

```typescript
const client = new StreamClient({
  url: 'http://your-server.com',
  secretID: 'your-secret-id',
  secretKey: 'your-secret-key',
  reconnectInterval: 5000,        // Reconnection interval in ms
  maxReconnectAttempts: 10,       // Max reconnection attempts
  autoConnect: true               // Auto-connect on initialization
});
```

## Error Handling

```typescript
try {
  const users = await client.users.getUsers();
} catch (error) {
  console.error('API Error:', error);
}

// Global error handling
client.on('error', (error) => {
  console.error('Connection error:', error);
});

client.on('maxReconnectAttemptsReached', ({ error }) => {
  console.error('Failed to reconnect:', error);
});
```

## Type Definitions

The library includes comprehensive TypeScript definitions:

```typescript
interface User {
  id: string;
  name: string;
  external_id: string;
  created_at: string;
  extra: Record<string, any>;
}

interface Message {
  id: string;
  content: string;
  user?: User;
  channel?: Channel;
  created_at: string;
  extra?: Record<string, any>;
}

interface Channel {
  id: string;
  name: string;
  participants?: Participant[];
  created_at: string;
  extra?: Record<string, any>;
}
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Node.js Support

- Node.js 16+

## React Native Support

Full support for React Native with file upload capabilities:

```typescript
import { FileService } from '@streammint/client';

// Create file-like object for React Native
const file = FileService.createFileLike(
  imageUri,
  'image/jpeg',
  'photo.jpg'
);

await client.files.uploadSingleFile(file);
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For support, email support@streammint.com or create an issue on GitHub.
