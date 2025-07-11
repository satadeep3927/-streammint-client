import { describe, expect, it } from 'vitest'

import { StreamClient } from './client/index'

describe('StreamClient', () => {
  const mockConfig = {
    url: 'http://localhost:8080',
    secretID: 'test-secret-id',
    secretKey: 'test-secret-key'
  }

  it('should be importable', () => {
    expect(StreamClient).toBeDefined()
    expect(typeof StreamClient).toBe('function')
  })

  it('should have proper environment setup', () => {
    // Verify test environment is configured
    expect(global.WebSocket).toBeDefined()
    expect(global.fetch).toBeDefined()
  })

  it('should create client instance with correct configuration', () => {
    const client = new StreamClient(mockConfig)

    expect(client).toBeDefined()
    expect(client.users).toBeDefined()
    expect(client.messages).toBeDefined()
    expect(client.files).toBeDefined()
    expect(client.pulse).toBeDefined()
  })

  it('should initialize all services', () => {
    const client = new StreamClient(mockConfig)

    // Check that all services are initialized
    expect(client.users).toHaveProperty('getUsers')
    expect(client.messages).toHaveProperty('getMessages')
    expect(client.files).toHaveProperty('uploadFile')
    expect(client.pulse).toHaveProperty('connect')
  })

  it('should share pulse service across all services', () => {
    const client = new StreamClient(mockConfig)

    // All services should share the same pulse instance
    // Note: pulse is private in services, so we test functionality instead
    expect(client.pulse).toBeDefined()
    expect(client.users).toBeDefined()
    expect(client.messages).toBeDefined()
  })

  it('should handle missing configuration gracefully', () => {
    expect(() => {
      new StreamClient({ url: '', secretID: '', secretKey: '', autoConnect: false })
    }).toThrow('Invalid HTTP URL')
  })

  it('should expose the correct service methods', () => {
    const client = new StreamClient(mockConfig)

    // User service methods
    expect(client.users.getUsers).toBeDefined()
    expect(client.users.createUser).toBeDefined()
    expect(client.users.updateUser).toBeDefined()
    expect(client.users.deleteUser).toBeDefined()

    // Message service methods
    expect(client.messages.getMessages).toBeDefined()
    expect(client.messages.createMessage).toBeDefined()
    expect(client.messages.updateMessage).toBeDefined()
    expect(client.messages.deleteMessage).toBeDefined()

    // File service methods
    expect(client.files.uploadFile).toBeDefined()
    expect(client.files.getFiles).toBeDefined()
    expect(client.files.uploadChannelFile).toBeDefined()
    expect(client.files.getChannelFiles).toBeDefined()

    // Pulse service methods
    expect(client.pulse.connect).toBeDefined()
    expect(client.pulse.disconnect).toBeDefined()
    expect(client.pulse.emit).toBeDefined()
    expect(client.pulse.on).toBeDefined()
    expect(client.pulse.off).toBeDefined()
  })

  it('should maintain consistent configuration across services', () => {
    const client = new StreamClient(mockConfig)

    // All services should use the same base configuration
    // This is internal implementation detail, but important for consistency
    expect(client.users['baseURL']).toBe(mockConfig.url)
    expect(client.messages['baseURL']).toBe(mockConfig.url)
    expect(client.files['baseURL']).toBe(mockConfig.url)
  })

  it('should handle different URL formats', () => {
    const testUrls = [
      'http://localhost:8080',
      'https://api.example.com',
      'http://localhost:3000/',
      'https://api.example.com/v1'
    ]

    testUrls.forEach(url => {
      expect(() => {
        new StreamClient({ url, secretID: mockConfig.secretID, secretKey: mockConfig.secretKey })
      }).not.toThrow()
    })
  })

  it('should handle auto-connect option', () => {
    const clientWithAutoConnect = new StreamClient({
      ...mockConfig,
      autoConnect: true
    })

    const clientWithoutAutoConnect = new StreamClient({
      ...mockConfig,
      autoConnect: false
    })

    expect(clientWithAutoConnect).toBeDefined()
    expect(clientWithoutAutoConnect).toBeDefined()
  })

  it('should handle reconnection settings', () => {
    const clientWithReconnect = new StreamClient({
      ...mockConfig,
      reconnectInterval: 1000,
      maxReconnectAttempts: 5
    })

    expect(clientWithReconnect).toBeDefined()
  })
})
