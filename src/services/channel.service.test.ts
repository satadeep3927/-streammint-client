import { Channel, CraeteChannelArgs } from '../types/channel.type'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import ChannelService from './channel.service'
import { PulseService } from './pulse.service'
import axios from 'axios'

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: {
          use: vi.fn(),
          eject: vi.fn(),
          clear: vi.fn()
        },
        response: {
          use: vi.fn(),
          eject: vi.fn(),
          clear: vi.fn()
        }
      }
    }))
  }
}))

// Mock PulseService
vi.mock('./pulse.service', () => ({
  PulseService: vi.fn(() => ({
    emit: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    isConnected: false
  }))
}))

describe('ChannelService', () => {
  let channelService: ChannelService
  let mockAxiosInstance: any
  let mockPulseService: any

  const mockConfig = {
    baseURL: 'http://localhost:8080',
    secretID: 'test-secret-id',
    secretKey: 'test-secret-key'
  }

  const mockChannel: Channel = {
    id: 'channel-123',
    name: 'Test Channel',
    extra: { description: 'A test channel' },
    participants: [],
    created_at: '2023-01-01T00:00:00Z'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Create mock axios instance
    mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: {
          use: vi.fn(),
          eject: vi.fn(),
          clear: vi.fn()
        },
        response: {
          use: vi.fn(),
          eject: vi.fn(),
          clear: vi.fn()
        }
      }
    }
    
    // Mock axios.create
    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance)
    
    // Create mock pulse service
    mockPulseService = {
      emit: vi.fn(),
      connect: vi.fn(),
      disconnect: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      isConnected: false
    }
    
    // Mock the PulseService constructor
    vi.mocked(PulseService).mockImplementation(() => mockPulseService)
    
    channelService = new ChannelService(
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
      expect(channelService).toBeDefined()
      expect(channelService.participants).toBeDefined()
      expect(channelService.pulse).toBe(mockPulseService)
      expect(channelService.channelID).toBeNull()
    })

    it('should set up axios with correct base URL', () => {
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: mockConfig.baseURL,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    })
  })

  describe('getChannels', () => {
    it('should fetch all channels', async () => {
      const mockChannels = [mockChannel]
      mockAxiosInstance.get.mockResolvedValue({
        data: { data: mockChannels }
      })

      const result = await channelService.getChannels()
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/v1/project/channels')
      expect(result.toArray()).toEqual(mockChannels)
    })

    it('should handle empty channel list', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: { data: [] }
      })

      const result = await channelService.getChannels()
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/v1/project/channels')
      expect(result.toArray()).toEqual([])
    })

    it('should handle API errors', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('API Error'))

      await expect(channelService.getChannels()).rejects.toThrow('API Error')
    })
  })

  describe('getChannel', () => {
    it('should fetch a specific channel by ID', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: { data: mockChannel }
      })

      const result = await channelService.getChannel('channel-123')
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/v1/project/channels/channel-123')
      expect(result).toEqual(mockChannel)
    })

    it('should handle non-existent channel', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Channel not found'))

      await expect(channelService.getChannel('non-existent')).rejects.toThrow('Channel not found')
    })
  })

  describe('getChannelsByUserID', () => {
    it('should fetch channels for a specific user', async () => {
      const mockChannels = [mockChannel]
      mockAxiosInstance.get.mockResolvedValue({
        data: { data: mockChannels }
      })

      const result = await channelService.getChannelsByUserID('user-123')
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/v1/project/channels/participants/user-123')
      expect(result.toArray()).toEqual(mockChannels)
    })

    it('should handle user with no channels', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: { data: [] }
      })

      const result = await channelService.getChannelsByUserID('user-123')
      
      expect(result.toArray()).toEqual([])
    })
  })

  describe('createChannel', () => {
    it('should create a new channel', async () => {
      const createArgs: CraeteChannelArgs = {
        name: 'New Channel',
        extra: { description: 'A new channel' }
      }

      mockAxiosInstance.post.mockResolvedValue({
        data: { data: mockChannel }
      })

      const result = await channelService.createChannel(createArgs)
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/v1/project/channels', createArgs)
      expect(result).toEqual(mockChannel)
    })

    it('should emit channel_create event', async () => {
      const createArgs: CraeteChannelArgs = {
        name: 'New Channel',
        extra: { description: 'A new channel' }
      }

      mockAxiosInstance.post.mockResolvedValue({
        data: { data: mockChannel }
      })

      await channelService.createChannel(createArgs)
      
      expect(mockPulseService.emit).toHaveBeenCalledWith('channel_create', mockChannel)
    })

    it('should handle creation errors', async () => {
      const createArgs: CraeteChannelArgs = {
        name: 'New Channel'
      }

      mockAxiosInstance.post.mockRejectedValue(new Error('Creation failed'))

      await expect(channelService.createChannel(createArgs)).rejects.toThrow('Creation failed')
    })

    it('should not fail if pulse service is not available', async () => {
      const createArgs: CraeteChannelArgs = {
        name: 'New Channel'
      }

      mockAxiosInstance.post.mockResolvedValue({
        data: { data: mockChannel }
      })

      // Create service without pulse
      const serviceWithoutPulse = new ChannelService(
        mockConfig.baseURL,
        mockConfig.secretID,
        mockConfig.secretKey,
        null as any
      )

      const result = await serviceWithoutPulse.createChannel(createArgs)
      
      expect(result).toEqual(mockChannel)
    })
  })

  describe('updateChannel', () => {
    it('should update an existing channel', async () => {
      const updateArgs = {
        name: 'Updated Channel',
        extra: { description: 'Updated description' }
      }

      const updatedChannel = { ...mockChannel, ...updateArgs }
      mockAxiosInstance.put.mockResolvedValue({
        data: { data: updatedChannel }
      })

      const result = await channelService.updateChannel('channel-123', updateArgs)
      
      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/v1/project/channels/channel-123', updateArgs)
      expect(result).toEqual(updatedChannel)
    })

    it('should emit channel_update event', async () => {
      const updateArgs = {
        name: 'Updated Channel'
      }

      const updatedChannel = { ...mockChannel, ...updateArgs }
      mockAxiosInstance.put.mockResolvedValue({
        data: { data: updatedChannel }
      })

      await channelService.updateChannel('channel-123', updateArgs)
      
      expect(mockPulseService.emit).toHaveBeenCalledWith('channel_update', updatedChannel)
    })

    it('should handle update errors', async () => {
      const updateArgs = {
        name: 'Updated Channel'
      }

      mockAxiosInstance.put.mockRejectedValue(new Error('Update failed'))

      await expect(channelService.updateChannel('channel-123', updateArgs)).rejects.toThrow('Update failed')
    })

    it('should handle partial updates', async () => {
      const updateArgs = {
        extra: { newField: 'value' }
      }

      const updatedChannel = { ...mockChannel, ...updateArgs }
      mockAxiosInstance.put.mockResolvedValue({
        data: { data: updatedChannel }
      })

      const result = await channelService.updateChannel('channel-123', updateArgs)
      
      expect(result).toEqual(updatedChannel)
    })
  })

  describe('deleteChannel', () => {
    it('should delete a channel', async () => {
      mockAxiosInstance.delete.mockResolvedValue({})

      await channelService.deleteChannel('channel-123')
      
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/v1/project/channels/channel-123')
    })

    it('should emit channel_delete event', async () => {
      mockAxiosInstance.delete.mockResolvedValue({})

      await channelService.deleteChannel('channel-123')
      
      expect(mockPulseService.emit).toHaveBeenCalledWith('channel_delete', { id: 'channel-123' })
    })

    it('should handle deletion errors', async () => {
      mockAxiosInstance.delete.mockRejectedValue(new Error('Deletion failed'))

      await expect(channelService.deleteChannel('channel-123')).rejects.toThrow('Deletion failed')
    })

    it('should not fail if pulse service is not available', async () => {
      mockAxiosInstance.delete.mockResolvedValue({})

      // Create service without pulse
      const serviceWithoutPulse = new ChannelService(
        mockConfig.baseURL,
        mockConfig.secretID,
        mockConfig.secretKey,
        null as any
      )

      await expect(serviceWithoutPulse.deleteChannel('channel-123')).resolves.not.toThrow()
    })
  })

  describe('connect', () => {
    it('should connect to a specific channel', async () => {
      await channelService.connect('channel-123')
      
      expect(channelService.channelID).toBe('channel-123')
    })

    it('should update channel ID when connecting to different channel', async () => {
      await channelService.connect('channel-123')
      expect(channelService.channelID).toBe('channel-123')
      
      await channelService.connect('channel-456')
      expect(channelService.channelID).toBe('channel-456')
    })

    it('should handle empty channel ID', async () => {
      await channelService.connect('')
      
      expect(channelService.channelID).toBe('')
    })
  })

  describe('integration with participants', () => {
    it('should have participants service initialized', () => {
      expect(channelService.participants).toBeDefined()
      expect(channelService.participants).toHaveProperty('getParticipants')
    })
  })

  describe('error handling', () => {
    it('should handle network errors gracefully', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Network error'))

      await expect(channelService.getChannels()).rejects.toThrow('Network error')
    })

    it('should handle malformed response data', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: null
      })

      await expect(channelService.getChannels()).rejects.toThrow()
    })
  })
})
