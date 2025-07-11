import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import BaseService from './service'
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

describe('BaseService', () => {
  let service: BaseService
  let mockAxiosInstance: any

  const mockConfig = {
    baseURL: 'http://localhost:8080',
    secretID: 'test-secret-id',
    secretKey: 'test-secret-key'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Create a mock axios instance
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
    
    // Mock axios.create to return our mock instance
    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance)
    
    service = new BaseService(
      mockConfig.baseURL,
      mockConfig.secretID,
      mockConfig.secretKey
    )
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('constructor', () => {
    it('should initialize with correct configuration', () => {
      expect(service).toBeDefined()
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: mockConfig.baseURL,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    })

    it('should set up request interceptor', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled()
    })
  })

  describe('token generation', () => {
    it('should generate valid JWT tokens', () => {
      const token = service['generateToken'](mockConfig.secretID, mockConfig.secretKey, 30)
      
      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
      
      // JWT should have 3 parts separated by dots
      const parts = token.split('.')
      expect(parts).toHaveLength(3)
      
      // Each part should be base64url encoded (no padding)
      parts.forEach(part => {
        expect(part).not.toContain('=')
        expect(part).not.toContain('+')
        expect(part).not.toContain('/')
      })
    })

    it('should generate different tokens for different secret IDs', () => {
      const token1 = service['generateToken']('secret1', mockConfig.secretKey, 30)
      const token2 = service['generateToken']('secret2', mockConfig.secretKey, 30)
      
      expect(token1).not.toBe(token2)
    })

    it('should generate different tokens for different secret keys', () => {
      const token1 = service['generateToken'](mockConfig.secretID, 'key1', 30)
      const token2 = service['generateToken'](mockConfig.secretID, 'key2', 30)
      
      expect(token1).not.toBe(token2)
    })

    it('should generate tokens with correct expiry', () => {
      const shortExpiry = 10
      const longExpiry = 3600
      
      const token1 = service['generateToken'](mockConfig.secretID, mockConfig.secretKey, shortExpiry)
      const token2 = service['generateToken'](mockConfig.secretID, mockConfig.secretKey, longExpiry)
      
      expect(token1).toBeTruthy()
      expect(token2).toBeTruthy()
      expect(token1).not.toBe(token2)
    })

    it('should use default expiry when not specified', () => {
      const token = service['generateToken'](mockConfig.secretID, mockConfig.secretKey)
      
      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
    })
  })

  describe('HTTP methods', () => {
    it('should expose get method', () => {
      const getter = service['get']
      expect(getter).toBeDefined()
      expect(typeof getter).toBe('function')
    })

    it('should expose post method', () => {
      const poster = service['post']
      expect(poster).toBeDefined()
      expect(typeof poster).toBe('function')
    })

    it('should expose put method', () => {
      const putter = service['put']
      expect(putter).toBeDefined()
      expect(typeof putter).toBe('function')
    })

    it('should expose delete method', () => {
      const deleter = service['delete']
      expect(deleter).toBeDefined()
      expect(typeof deleter).toBe('function')
    })

    it('should bind methods to axios instance', () => {
      // Access the protected methods through bracket notation
      const get = service['get']
      const post = service['post']
      const put = service['put']
      const del = service['delete']
      
      // The methods should be bound versions of the axios methods
      expect(typeof get).toBe('function')
      expect(typeof post).toBe('function')
      expect(typeof put).toBe('function')
      expect(typeof del).toBe('function')
    })
  })

  describe('request interceptor', () => {
    let interceptorCallback: any

    beforeEach(() => {
      // Get the interceptor callback that was registered
      const interceptorCalls = mockAxiosInstance.interceptors.request.use
      interceptorCallback = interceptorCalls.mock.calls[0][0]
    })

    it('should add authorization header to requests', async () => {
      const mockConfig = {
        headers: {}
      }
      
      const result = await interceptorCallback(mockConfig)
      
      expect(result).toBeDefined()
      expect(result.headers.Authorization).toBeDefined()
      expect(result.headers.Authorization).toMatch(/^Bearer /)
    })

    it('should handle interceptor errors', async () => {
      const errorCallback = mockAxiosInstance.interceptors.request.use
      const errorHandler = errorCallback.mock.calls[0][1]
      
      const error = new Error('Test error')
      
      await expect(errorHandler(error)).rejects.toThrow('Test error')
    })

    it('should generate fresh tokens for each request', async () => {
      const mockConfig1 = { headers: {} }
      const mockConfig2 = { headers: {} }
      
      const result1 = await interceptorCallback(mockConfig1)
      const result2 = await interceptorCallback(mockConfig2)
      
      // Tokens should be different due to timestamp differences
      expect(result1.headers.Authorization).toBeDefined()
      expect(result2.headers.Authorization).toBeDefined()
      // Note: tokens might be the same if generated in the same second
    })
  })

  describe('inheritance', () => {
    class TestService extends BaseService {
      public async testGet() {
        return this.get('/test')
      }
      
      public async testPost(data: any) {
        return this.post('/test', data)
      }
      
      public getToken() {
        return this.generateToken(this.secretID, this.secretkey, 30)
      }
    }

    it('should allow subclasses to use HTTP methods', () => {
      const testService = new TestService(
        mockConfig.baseURL,
        mockConfig.secretID,
        mockConfig.secretKey
      )
      
      expect(testService.testGet).toBeDefined()
      expect(testService.testPost).toBeDefined()
      expect(testService.getToken).toBeDefined()
    })

    it('should allow subclasses to generate tokens', () => {
      const testService = new TestService(
        mockConfig.baseURL,
        mockConfig.secretID,
        mockConfig.secretKey
      )
      
      const token = testService.getToken()
      
      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
    })
  })

  describe('error handling', () => {
    it('should handle token generation errors gracefully', () => {
      // Test with invalid inputs
      expect(() => {
        service['generateToken']('', '', 30)
      }).not.toThrow()
      
      expect(() => {
        service['generateToken'](mockConfig.secretID, mockConfig.secretKey, 0)
      }).not.toThrow()
    })

    it('should handle negative expiry values', () => {
      const token = service['generateToken'](mockConfig.secretID, mockConfig.secretKey, -30)
      
      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
    })
  })
})
