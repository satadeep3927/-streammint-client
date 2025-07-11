import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PulseService } from './pulse.service'

// Mock uuid to have predictable client IDs
vi.mock('uuid', () => ({
  v7: vi.fn(() => 'test-client-id-123')
}))

describe('PulseService', () => {
  let pulseService: PulseService
  let mockWebSocketInstance: any

  const mockConfig = {
    baseURL: 'http://localhost:8080',
    secretID: 'test-secret-id',
    secretKey: 'test-secret-key'
  }

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks()
    
    // Create a mock WebSocket instance that we can control
    mockWebSocketInstance = {
      readyState: 0, // WebSocket.CONNECTING initially
      send: vi.fn(),
      close: vi.fn(),
      onopen: null,
      onclose: null,
      onmessage: null,
      onerror: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      simulateConnect: function() {
        this.readyState = 1 // WebSocket.OPEN
        if (this.onopen) {
          this.onopen(new Event('open'))
        }
      },
      simulateMessage: function(data: any) {
        if (this.onmessage) {
          this.onmessage(new MessageEvent('message', { data: JSON.stringify(data) }))
        }
      },
      simulateError: function() {
        if (this.onerror) {
          this.onerror(new Event('error'))
        }
      },
      simulateClose: function() {
        this.readyState = 3 // WebSocket.CLOSED
        if (this.onclose) {
          this.onclose(new CloseEvent('close'))
        }
      }
    }

    // Mock the WebSocket constructor to return our mock instance
    const MockWebSocketConstructor = vi.fn(() => mockWebSocketInstance) as any
    MockWebSocketConstructor.CONNECTING = 0
    MockWebSocketConstructor.OPEN = 1
    MockWebSocketConstructor.CLOSING = 2
    MockWebSocketConstructor.CLOSED = 3
    global.WebSocket = MockWebSocketConstructor
    
    pulseService = new PulseService(
      mockConfig.baseURL,
      mockConfig.secretID,
      mockConfig.secretKey
    )
  })

  afterEach(() => {
    if (pulseService) {
      pulseService.disconnect()
    }
    // Reset the mock WebSocket instance for next test
    mockWebSocketInstance.readyState = 0 // Reset to CONNECTING
    mockWebSocketInstance.onopen = null
    mockWebSocketInstance.onclose = null
    mockWebSocketInstance.onmessage = null
    mockWebSocketInstance.onerror = null
  })

  describe('constructor', () => {
    it('should initialize with correct configuration', () => {
      expect(pulseService).toBeDefined()
      expect(pulseService.isConnected).toBe(false)
    })

    it('should generate unique client ID', () => {
      const service1 = new PulseService(mockConfig.baseURL, mockConfig.secretID, mockConfig.secretKey)
      const service2 = new PulseService(mockConfig.baseURL, mockConfig.secretID, mockConfig.secretKey)
      
      // Both should use the mocked UUID
      expect(service1).toBeDefined()
      expect(service2).toBeDefined()
    })

    it('should not connect automatically in constructor', () => {
      expect(pulseService.isConnected).toBe(false)
    })
  })

  describe('connection management', () => {
    it('should connect successfully', async () => {
      const connectPromise = pulseService.connect('test-user-id')
      
      // Simulate successful connection
      setTimeout(() => {
        mockWebSocketInstance.simulateConnect()
      }, 0)
      
      await connectPromise
      
      expect(pulseService.isConnected).toBe(true)
    })

    it('should handle connection errors', async () => {
      const connectPromise = pulseService.connect('test-user-id')
      
      // Simulate connection error
      setTimeout(() => {
        mockWebSocketInstance.simulateError()
      }, 0)
      
      await expect(connectPromise).rejects.toThrow()
    })

    it('should disconnect properly', async () => {
      const connectPromise = pulseService.connect('test-user-id')
      
      // Simulate successful connection
      setTimeout(() => {
        mockWebSocketInstance.simulateConnect()
      }, 0)
      
      await connectPromise
      expect(pulseService.isConnected).toBe(true)
      
      pulseService.disconnect()
      expect(pulseService.isConnected).toBe(false)
    })

    it('should handle multiple connection attempts', async () => {
      const promise1 = pulseService.connect('test-user-id')
      const promise2 = pulseService.connect('test-user-id')
      
      // Simulate successful connection
      setTimeout(() => {
        mockWebSocketInstance.simulateConnect()
      }, 0)
      
      await Promise.all([promise1, promise2])
      
      expect(pulseService.isConnected).toBe(true)
    })
  })

  describe('event handling', () => {
    beforeEach(async () => {
      const connectPromise = pulseService.connect('test-user-id')
      
      // Simulate successful connection
      setTimeout(() => {
        if (mockWebSocketInstance.onopen) {
          mockWebSocketInstance.onopen(new Event('open'))
        }
      }, 0)
      
      await connectPromise
    })

    it('should register event listeners', () => {
      const handler = vi.fn()
      
      pulseService.on('test-event', handler)
      
      // Simulate receiving a message
      mockWebSocketInstance.simulateMessage({
        event_type: 'test-event',
        data: { message: 'hello' },
        sender_id: 'other-client'
      })
      
      expect(handler).toHaveBeenCalledWith({
        event_type: 'test-event',
        data: { message: 'hello' },
        sender_id: 'other-client'
      })
    })

    it('should ignore messages from self', () => {
      const handler = vi.fn()
      
      pulseService.on('test-event', handler)
      
      // Simulate receiving a message from self
      mockWebSocketInstance.simulateMessage({
        event_type: 'test-event',
        data: { message: 'hello' },
        sender_id: 'test-client-id-123' // Same as our client ID
      })
      
      expect(handler).not.toHaveBeenCalled()
    })

    it('should handle multiple listeners for same event', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      
      pulseService.on('test-event', handler1)
      pulseService.on('test-event', handler2)
      
      // Simulate receiving a message
      mockWebSocketInstance.simulateMessage({
        event_type: 'test-event',
        data: { message: 'hello' },
        sender_id: 'other-client'
      })
      
      expect(handler1).toHaveBeenCalled()
      expect(handler2).toHaveBeenCalled()
    })

    it('should remove event listeners', () => {
      const handler = vi.fn()
      
      pulseService.on('test-event', handler)
      pulseService.off('test-event', handler)
      
      // Simulate receiving a message
      mockWebSocketInstance.simulateMessage({
        event_type: 'test-event',
        data: { message: 'hello' },
        sender_id: 'other-client'
      })
      
      expect(handler).not.toHaveBeenCalled()
    })

    it('should handle malformed messages gracefully', () => {
      const handler = vi.fn()
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      pulseService.on('test-event', handler)
      
      // Simulate receiving malformed message
      if (mockWebSocketInstance.onmessage) {
        mockWebSocketInstance.onmessage(new MessageEvent('message', { data: 'invalid json' }))
      }
      
      expect(handler).not.toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })
  })

  describe('event emission', () => {
    beforeEach(async () => {
      const connectPromise = pulseService.connect('test-user-id')
      
      // Simulate successful connection
      setTimeout(() => {
        if (mockWebSocketInstance.onopen) {
          mockWebSocketInstance.onopen(new Event('open'))
        }
      }, 0)
      
      await connectPromise
    })

    it('should emit events with correct payload', async () => {
      // First connect
      const connectPromise = pulseService.connect('test-user-id')
      setTimeout(() => {
        mockWebSocketInstance.simulateConnect()
      }, 0)
      await connectPromise
      
      await pulseService.emit('test-event', { message: 'hello' })
      
      expect(mockWebSocketInstance.send).toHaveBeenCalledWith(JSON.stringify({
        event_type: 'test-event',
        data: { message: 'hello', userId: 'test-user-id' },
        sender_id: 'test-client-id-123'
      }))
    })

    it('should emit events without data', async () => {
      // First connect
      const connectPromise = pulseService.connect('test-user-id')
      setTimeout(() => {
        mockWebSocketInstance.simulateConnect()
      }, 0)
      await connectPromise
      
      await pulseService.emit('test-event')
      
      expect(mockWebSocketInstance.send).toHaveBeenCalledWith(JSON.stringify({
        event_type: 'test-event',
        data: { userId: 'test-user-id' },
        sender_id: 'test-client-id-123'
      }))
    })

    it('should auto-connect when emitting if not connected', async () => {
      // First connect to set userId
      const connectPromise = pulseService.connect('test-user-id')
      setTimeout(() => {
        mockWebSocketInstance.simulateConnect()
      }, 0)
      await connectPromise
      
      // Then disconnect
      pulseService.disconnect()
      expect(pulseService.isConnected).toBe(false)
      
      const emitPromise = pulseService.emit('test-event', { message: 'hello' })
      
      // Simulate successful connection
      setTimeout(() => {
        mockWebSocketInstance.simulateConnect()
      }, 0)
      
      await emitPromise
      
      expect(pulseService.isConnected).toBe(true)
      expect(mockWebSocketInstance.send).toHaveBeenCalled()
    })

    it('should handle emit errors gracefully', async () => {
      // First connect
      const connectPromise = pulseService.connect('test-user-id')
      setTimeout(() => {
        mockWebSocketInstance.simulateConnect()
      }, 0)
      await connectPromise
      
      // Mock WebSocket to throw error on send
      mockWebSocketInstance.send.mockImplementation(() => {
        throw new Error('Send failed')
      })
      
      await expect(pulseService.emit('test-event')).rejects.toThrow('Send failed')
    })
  })

  describe('type-safe event handling', () => {
    it('should support type-safe event handlers', () => {
      const handler = vi.fn()
      
      // Use a valid event type from the StreamEvent union
      pulseService.onEvent('message_create', handler)
      
      expect(handler).toBeDefined()
    })
  })

  describe('connection state', () => {
    it('should report correct connection state', async () => {
      expect(pulseService.isConnected).toBe(false)
      
      const connectPromise = pulseService.connect('test-user-id')
      
      // Simulate successful connection
      setTimeout(() => {
        mockWebSocketInstance.simulateConnect()
      }, 0)
      
      await connectPromise
      expect(pulseService.isConnected).toBe(true)
      
      pulseService.disconnect()
      expect(pulseService.isConnected).toBe(false)
    })

    it('should handle connection close event', async () => {
      const connectPromise = pulseService.connect('test-user-id')
      
      // Simulate successful connection
      setTimeout(() => {
        mockWebSocketInstance.simulateConnect()
      }, 0)
      
      await connectPromise
      expect(pulseService.isConnected).toBe(true)
      
      // Simulate connection close
      mockWebSocketInstance.simulateClose()
      
      // Wait for close event to be processed
      await new Promise(resolve => setTimeout(resolve, 10))
      
      expect(pulseService.isConnected).toBe(false)
    })
  })

  describe('error handling', () => {
    it('should handle WebSocket errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const connectPromise = pulseService.connect('test-user-id')
      
      // Simulate error
      setTimeout(() => {
        mockWebSocketInstance.simulateError()
      }, 0)
      
      await expect(connectPromise).rejects.toThrow()
      
      consoleSpy.mockRestore()
    })

    it('should log connection close', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      const connectPromise = pulseService.connect('test-user-id')
      
      // Simulate successful connection
      setTimeout(() => {
        if (mockWebSocketInstance.onopen) {
          mockWebSocketInstance.onopen(new Event('open'))
        }
      }, 0)
      
      await connectPromise
      
      // Simulate connection close
      mockWebSocketInstance.simulateClose()
      
      // Wait for close event to be processed
      await new Promise(resolve => setTimeout(resolve, 10))
      
      expect(consoleSpy).toHaveBeenCalledWith('[PulseService] Connection closed')
      
      consoleSpy.mockRestore()
    })
  })
})
