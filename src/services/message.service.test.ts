import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { MessageService } from './message.service'
import { PulseService } from './pulse.service'
import axios from 'axios'

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn()
  }
}))

// Mock the LINQ library
vi.mock('linq-to-typescript', () => ({
  from: vi.fn((data) => ({
    ...data,
    where: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    toArray: vi.fn(() => data),
  }))
}))

describe('MessageService', () => {
  let messageService: MessageService
  let mockPulseService: any
  let mockAxiosInstance: any

  const mockConfig = {
    baseURL: 'http://localhost:8080',
    secretID: 'test-secret-id',
    secretKey: 'test-secret-key'
  }

  const mockMessage = {
    id: 'msg-123',
    content: 'Hello world',
    user: { 
      id: 'user-123', 
      name: 'Test User',
      external_id: 'ext-user-123',
      created_at: '2023-01-01T00:00:00Z',
      extra: {}
    },
    channel: { 
      id: 'channel-123', 
      name: 'Test Channel',
      created_at: '2023-01-01T00:00:00Z',
      extra: {}
    },
    created_at: '2023-01-01T00:00:00Z',
    extra: { metadata: 'test' }
  }

  const mockMessages = [mockMessage, { ...mockMessage, id: 'msg-456', content: 'Another message' }]

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks()

    // Create mock axios instance
    mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: {
          use: vi.fn()
        }
      }
    }

    // Mock axios.create to return our mock instance
    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance)

    // Create mock PulseService
    mockPulseService = {
      emit: vi.fn().mockResolvedValue(undefined),
      on: vi.fn(),
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn(),
      isConnected: false
    }

    // Create MessageService instance
    messageService = new MessageService(
      mockConfig.baseURL,
      mockConfig.secretID,
      mockConfig.secretKey,
      mockPulseService
    )
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('constructor', () => {
    it('should initialize with correct configuration', () => {
      expect(messageService).toBeDefined()
      expect(messageService.pulse).toBe(mockPulseService)
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: mockConfig.baseURL,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })
  })

  describe('custom events', () => {
    it('should listen for custom events', () => {
      const handler = vi.fn()
      messageService.onCustomEvent('test-event', handler)
      
      expect(mockPulseService.on).toHaveBeenCalledWith('test-event', handler)
    })

    it('should emit custom events', async () => {
      const eventData = { foo: 'bar' }
      await messageService.emitCustomEvent('test-event', eventData)
      
      expect(mockPulseService.emit).toHaveBeenCalledWith('test-event', eventData)
    })
  })

  describe('getMessages', () => {
    it('should get messages for a channel', async () => {
      const mockResponse = { data: { data: mockMessages } }
      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await messageService.getMessages('channel-123')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/v1/project/messages/channel-123')
      expect(result).toBeDefined()
    })

    it('should handle API errors', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('API Error'))

      await expect(messageService.getMessages('channel-123')).rejects.toThrow('API Error')
    })
  })

  describe('getMessagesAfter', () => {
    it('should get messages after a specific datetime with default options', async () => {
      const mockResponse = { data: { data: mockMessages } }
      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await messageService.getMessagesAfter('channel-123')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/v1/project/messages/channel-123/after')
      expect(result).toBeDefined()
    })

    it('should get messages after a specific datetime with limit', async () => {
      const mockResponse = { data: { data: mockMessages } }
      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      await messageService.getMessagesAfter('channel-123', { limit: 25 })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/v1/project/messages/channel-123/after?limit=25')
    })

    it('should get messages after a specific datetime with datetime and limit', async () => {
      const mockResponse = { data: { data: mockMessages } }
      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const datetime = '2023-01-01T12:00:00Z'
      await messageService.getMessagesAfter('channel-123', { 
        datetime, 
        limit: 50 
      })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/v1/project/messages/channel-123/after?datetime=2023-01-01T12%3A00%3A00Z&limit=50'
      )
    })

    it('should handle Date objects', async () => {
      const mockResponse = { data: { data: mockMessages } }
      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const date = new Date('2023-01-01T12:00:00Z')
      await messageService.getMessagesAfter('channel-123', { datetime: date })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/v1/project/messages/channel-123/after?datetime=2023-01-01T12%3A00%3A00.000Z'
      )
    })
  })

  describe('getMessagesBefore', () => {
    it('should get messages before a specific datetime with default options', async () => {
      const mockResponse = { data: { data: mockMessages } }
      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await messageService.getMessagesBefore('channel-123')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/v1/project/messages/channel-123/before')
      expect(result).toBeDefined()
    })

    it('should get messages before a specific datetime with datetime and limit', async () => {
      const mockResponse = { data: { data: mockMessages } }
      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const datetime = '2023-01-01T12:00:00Z'
      await messageService.getMessagesBefore('channel-123', { 
        datetime, 
        limit: 30 
      })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/v1/project/messages/channel-123/before?datetime=2023-01-01T12%3A00%3A00Z&limit=30'
      )
    })
  })

  describe('searchMessages', () => {
    it('should search messages in a channel', async () => {
      const mockResponse = { data: { data: mockMessages } }
      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await messageService.searchMessages('channel-123', { query: 'hello' })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/v1/project/messages/channel-123/search?query=hello')
      expect(result).toBeDefined()
    })

    it('should handle special characters in search query', async () => {
      const mockResponse = { data: { data: mockMessages } }
      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      await messageService.searchMessages('channel-123', { query: 'hello world & test' })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/v1/project/messages/channel-123/search?query=hello+world+%26+test')
    })
  })

  describe('createMessage', () => {
    it('should create a message and emit pulse event', async () => {
      const createArgs = { content: 'Test message', userId: 'user-123', channelId: 'channel-123' }
      const mockResponse = { data: { data: mockMessage } }
      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await messageService.createMessage(createArgs)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/v1/project/messages/channel-123', createArgs)
      expect(mockPulseService.emit).toHaveBeenCalledWith('message_create', mockMessage)
      expect(result).toEqual(mockMessage)
    })

    it('should create a message without pulse service', async () => {
      // Create service without pulse
      const messageServiceWithoutPulse = new MessageService(
        mockConfig.baseURL,
        mockConfig.secretID,
        mockConfig.secretKey,
        null as any
      )

      mockAxiosInstance.post.mockResolvedValue({ data: { data: mockMessage } })

      const createArgs = { content: 'Test message', userId: 'user-123', channelId: 'channel-123' }
      const result = await messageServiceWithoutPulse.createMessage(createArgs)

      expect(result).toEqual(mockMessage)
      // Should not try to emit when pulse is null
      expect(mockPulseService.emit).not.toHaveBeenCalled()
    })

    it('should handle creation errors', async () => {
      const createArgs = { content: 'Test message', userId: 'user-123', channelId: 'channel-123' }
      mockAxiosInstance.post.mockRejectedValue(new Error('Creation failed'))

      await expect(messageService.createMessage(createArgs)).rejects.toThrow('Creation failed')
    })
  })

  describe('updateMessage', () => {
    it('should update a message and emit pulse event', async () => {
      const updatedMessage = { ...mockMessage, content: 'Updated content' }
      const mockResponse = { data: { data: updatedMessage } }
      mockAxiosInstance.put.mockResolvedValue(mockResponse)

      const result = await messageService.updateMessage('channel-123', updatedMessage)

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/v1/project/messages/channel-123/msg-123', updatedMessage)
      expect(mockPulseService.emit).toHaveBeenCalledWith('message_update', updatedMessage)
      expect(result).toEqual(updatedMessage)
    })

    it('should handle update errors', async () => {
      mockAxiosInstance.put.mockRejectedValue(new Error('Update failed'))

      await expect(messageService.updateMessage('channel-123', mockMessage)).rejects.toThrow('Update failed')
    })
  })

  describe('deleteMessage', () => {
    it('should delete a message and emit pulse event', async () => {
      mockAxiosInstance.delete.mockResolvedValue({ data: { status: true } })

      await messageService.deleteMessage('channel-123', 'msg-123')

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/v1/project/messages/channel-123/msg-123')
      expect(mockPulseService.emit).toHaveBeenCalledWith('message_delete', { 
        id: 'msg-123', 
        channelId: 'channel-123' 
      })
    })

    it('should handle deletion errors', async () => {
      mockAxiosInstance.delete.mockRejectedValue(new Error('Deletion failed'))

      await expect(messageService.deleteMessage('channel-123', 'msg-123')).rejects.toThrow('Deletion failed')
    })
  })

  describe('error handling', () => {
    it('should propagate axios errors', async () => {
      const axiosError = new Error('Network error')
      mockAxiosInstance.get.mockRejectedValue(axiosError)

      await expect(messageService.getMessages('channel-123')).rejects.toThrow('Network error')
    })
  })
})
