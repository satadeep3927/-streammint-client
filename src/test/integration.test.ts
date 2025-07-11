import { describe, expect, it } from 'vitest'

import { CryptoService } from '../services/crypto.service'
import { getWebSocketFromHttpUrl } from '../lib/utils'

describe('Quick Integration Test', () => {
  it('should perform basic crypto operations', () => {
    const testString = 'Hello, World!'
    const encoded = CryptoService.base64UrlEncode(testString)
    
    expect(encoded).toBeTruthy()
    expect(encoded).not.toContain('=')
    expect(encoded).not.toContain('+')
    expect(encoded).not.toContain('/')
  })

  it('should convert HTTP URLs to WebSocket URLs', () => {
    const httpUrl = 'http://localhost:8080/api'
    const wsUrl = getWebSocketFromHttpUrl(httpUrl)
    
    expect(wsUrl).toBe('ws://localhost:8080/api')
  })

  it('should handle HTTPS to WSS conversion', () => {
    const httpsUrl = 'https://api.example.com/websocket'
    const wssUrl = getWebSocketFromHttpUrl(httpsUrl)
    
    expect(wssUrl).toBe('wss://api.example.com/websocket')
  })

  it('should generate HMAC signatures', () => {
    const signature = CryptoService.hmacSha256('test-key', 'test-message')
    
    expect(signature).toBeTruthy()
    expect(typeof signature).toBe('string')
    expect(signature.length).toBeGreaterThan(0)
  })

  it('should handle edge cases gracefully', () => {
    expect(() => {
      getWebSocketFromHttpUrl('invalid-url')
    }).toThrow()
    
    expect(() => {
      CryptoService.base64UrlEncode('')
    }).not.toThrow()
  })
})
