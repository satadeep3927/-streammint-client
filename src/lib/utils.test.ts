import { describe, expect, it } from 'vitest'

import { getWebSocketFromHttpUrl } from './utils'

describe('utils', () => {
  describe('getWebSocketFromHttpUrl', () => {
    it('should convert HTTP URL to WebSocket URL', () => {
      const httpUrl = 'http://localhost:8080'
      const result = getWebSocketFromHttpUrl(httpUrl)
      
      expect(result).toBe('ws://localhost:8080')
    })

    it('should convert HTTPS URL to secure WebSocket URL', () => {
      const httpsUrl = 'https://api.example.com'
      const result = getWebSocketFromHttpUrl(httpsUrl)
      
      expect(result).toBe('wss://api.example.com')
    })

    it('should preserve path and query parameters', () => {
      const httpUrl = 'http://localhost:8080/api/v1/websocket?token=abc123'
      const result = getWebSocketFromHttpUrl(httpUrl)
      
      expect(result).toBe('ws://localhost:8080/api/v1/websocket?token=abc123')
    })

    it('should preserve path and query parameters for HTTPS', () => {
      const httpsUrl = 'https://api.example.com/v1/pulse/client123/ws?token=xyz789'
      const result = getWebSocketFromHttpUrl(httpsUrl)
      
      expect(result).toBe('wss://api.example.com/v1/pulse/client123/ws?token=xyz789')
    })

    it('should handle URLs with port numbers', () => {
      const httpUrl = 'http://localhost:3000/websocket'
      const result = getWebSocketFromHttpUrl(httpUrl)
      
      expect(result).toBe('ws://localhost:3000/websocket')
    })

    it('should handle HTTPS URLs with port numbers', () => {
      const httpsUrl = 'https://secure.example.com:8443/websocket'
      const result = getWebSocketFromHttpUrl(httpsUrl)
      
      expect(result).toBe('wss://secure.example.com:8443/websocket')
    })

    it('should handle URLs with subdomains', () => {
      const httpUrl = 'http://api.subdomain.example.com/websocket'
      const result = getWebSocketFromHttpUrl(httpUrl)
      
      expect(result).toBe('ws://api.subdomain.example.com/websocket')
    })

    it('should handle URLs with complex paths', () => {
      const httpUrl = 'http://example.com/v1/api/pulse/client-123/ws'
      const result = getWebSocketFromHttpUrl(httpUrl)
      
      expect(result).toBe('ws://example.com/v1/api/pulse/client-123/ws')
    })

    it('should handle URLs with fragments', () => {
      const httpUrl = 'http://example.com/websocket#section1'
      const result = getWebSocketFromHttpUrl(httpUrl)
      
      expect(result).toBe('ws://example.com/websocket#section1')
    })

    it('should handle URLs with both query and fragment', () => {
      const httpUrl = 'http://example.com/websocket?param=value#section1'
      const result = getWebSocketFromHttpUrl(httpUrl)
      
      expect(result).toBe('ws://example.com/websocket?param=value#section1')
    })

    it('should throw error for invalid URLs', () => {
      expect(() => {
        getWebSocketFromHttpUrl('invalid-url')
      }).toThrow('Invalid HTTP URL')
    })

    it('should throw error for FTP URLs', () => {
      expect(() => {
        getWebSocketFromHttpUrl('ftp://example.com')
      }).toThrow('Invalid HTTP URL')
    })

    it('should throw error for WebSocket URLs', () => {
      expect(() => {
        getWebSocketFromHttpUrl('ws://example.com')
      }).toThrow('Invalid HTTP URL')
    })

    it('should throw error for empty string', () => {
      expect(() => {
        getWebSocketFromHttpUrl('')
      }).toThrow('Invalid HTTP URL')
    })

    it('should throw error for null or undefined', () => {
      expect(() => {
        getWebSocketFromHttpUrl(null as any)
      }).toThrow()
      
      expect(() => {
        getWebSocketFromHttpUrl(undefined as any)
      }).toThrow()
    })

    it('should handle case variations', () => {
      // The function is case-sensitive, so uppercase HTTP won't work
      expect(() => {
        getWebSocketFromHttpUrl('HTTP://EXAMPLE.COM/PATH')
      }).toThrow('Invalid HTTP URL')
    })

    it('should handle edge case with just protocol', () => {
      expect(() => {
        getWebSocketFromHttpUrl('http://')
      }).not.toThrow()
      
      expect(() => {
        getWebSocketFromHttpUrl('https://')
      }).not.toThrow()
    })
  })
})
