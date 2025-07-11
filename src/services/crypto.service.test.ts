import { describe, expect, it } from 'vitest'

import { CryptoService } from './crypto.service'

describe('CryptoService', () => {
  describe('base64UrlEncode', () => {
    it('should encode strings to base64url format', () => {
      const testString = 'hello world'
      const result = CryptoService.base64UrlEncode(testString)
      
      expect(result).toBe('aGVsbG8gd29ybGQ')
      expect(result).not.toContain('=')
      expect(result).not.toContain('+')
      expect(result).not.toContain('/')
    })

    it('should handle empty strings', () => {
      const result = CryptoService.base64UrlEncode('')
      expect(result).toBe('')
    })

    it('should handle JSON objects', () => {
      const obj = { typ: 'JWT', alg: 'HS256' }
      const result = CryptoService.base64UrlEncode(JSON.stringify(obj))
      
      expect(result).toBeTruthy()
      expect(result).not.toContain('=')
      expect(result).not.toContain('+')
      expect(result).not.toContain('/')
    })

    it('should handle Unicode characters', () => {
      const unicodeString = 'Hello 世界'
      const result = CryptoService.base64UrlEncode(unicodeString)
      
      expect(result).toBeTruthy()
      expect(result).not.toContain('=')
      expect(result).not.toContain('+')
      expect(result).not.toContain('/')
    })
  })

  describe('hmacSha256', () => {
    it('should generate consistent HMAC-SHA256 signatures', () => {
      const key = 'test-secret-key'
      const message = 'test message'
      
      const signature1 = CryptoService.hmacSha256(key, message)
      const signature2 = CryptoService.hmacSha256(key, message)
      
      expect(signature1).toBe(signature2)
      expect(signature1).toBeTruthy()
      expect(typeof signature1).toBe('string')
    })

    it('should generate different signatures for different messages', () => {
      const key = 'test-secret-key'
      const message1 = 'message 1'
      const message2 = 'message 2'
      
      const signature1 = CryptoService.hmacSha256(key, message1)
      const signature2 = CryptoService.hmacSha256(key, message2)
      
      expect(signature1).not.toBe(signature2)
    })

    it('should generate different signatures for different keys', () => {
      const key1 = 'secret-key-1'
      const key2 = 'secret-key-2'
      const message = 'test message'
      
      const signature1 = CryptoService.hmacSha256(key1, message)
      const signature2 = CryptoService.hmacSha256(key2, message)
      
      expect(signature1).not.toBe(signature2)
    })

    it('should handle empty strings', () => {
      const key = 'test-key'
      const message = ''
      
      const signature = CryptoService.hmacSha256(key, message)
      
      expect(signature).toBeTruthy()
      expect(typeof signature).toBe('string')
    })

    it('should handle long keys', () => {
      const longKey = 'a'.repeat(100) // Longer than block size (64 bytes)
      const message = 'test message'
      
      const signature = CryptoService.hmacSha256(longKey, message)
      
      expect(signature).toBeTruthy()
      expect(typeof signature).toBe('string')
    })

    it('should handle long messages', () => {
      const key = 'test-key'
      const longMessage = 'a'.repeat(1000)
      
      const signature = CryptoService.hmacSha256(key, longMessage)
      
      expect(signature).toBeTruthy()
      expect(typeof signature).toBe('string')
    })

    it('should return base64url encoded signatures', () => {
      const key = 'test-key'
      const message = 'test message'
      
      const signature = CryptoService.hmacSha256(key, message)
      
      // Base64url should not contain these characters
      expect(signature).not.toContain('=')
      expect(signature).not.toContain('+')
      expect(signature).not.toContain('/')
    })

    it('should handle JWT-like token strings', () => {
      const key = 'jwt-secret'
      const tokenString = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0LXNlY3JldCIsImlhdCI6MTcwNzM5MjQwMCwiZXhwIjoxNzA3MzkyNDMwfQ'
      
      const signature = CryptoService.hmacSha256(key, tokenString)
      
      expect(signature).toBeTruthy()
      expect(typeof signature).toBe('string')
      expect(signature).not.toContain('=')
      expect(signature).not.toContain('+')
      expect(signature).not.toContain('/')
    })
  })

  describe('integration tests', () => {
    it('should work together for JWT creation', () => {
      const header = { typ: 'JWT', alg: 'HS256' }
      const payload = { sub: 'test-user', iat: 1234567890, exp: 1234567920 }
      const secret = 'test-secret'
      
      const encodedHeader = CryptoService.base64UrlEncode(JSON.stringify(header))
      const encodedPayload = CryptoService.base64UrlEncode(JSON.stringify(payload))
      const tokenString = `${encodedHeader}.${encodedPayload}`
      const signature = CryptoService.hmacSha256(secret, tokenString)
      
      expect(encodedHeader).toBeTruthy()
      expect(encodedPayload).toBeTruthy()
      expect(signature).toBeTruthy()
      
      // Verify no padding characters
      expect(encodedHeader).not.toContain('=')
      expect(encodedPayload).not.toContain('=')
      expect(signature).not.toContain('=')
      
      // Verify complete JWT structure
      const jwt = `${tokenString}.${signature}`
      const jwtParts = jwt.split('.')
      expect(jwtParts).toHaveLength(3)
    })

    it('should generate reproducible results', () => {
      const header = { typ: 'JWT', alg: 'HS256' }
      const payload = { sub: 'test-user', iat: 1234567890, exp: 1234567920 }
      const secret = 'test-secret'
      
      // Generate JWT twice
      const encodedHeader1 = CryptoService.base64UrlEncode(JSON.stringify(header))
      const encodedPayload1 = CryptoService.base64UrlEncode(JSON.stringify(payload))
      const tokenString1 = `${encodedHeader1}.${encodedPayload1}`
      const signature1 = CryptoService.hmacSha256(secret, tokenString1)
      
      const encodedHeader2 = CryptoService.base64UrlEncode(JSON.stringify(header))
      const encodedPayload2 = CryptoService.base64UrlEncode(JSON.stringify(payload))
      const tokenString2 = `${encodedHeader2}.${encodedPayload2}`
      const signature2 = CryptoService.hmacSha256(secret, tokenString2)
      
      // Should be identical
      expect(encodedHeader1).toBe(encodedHeader2)
      expect(encodedPayload1).toBe(encodedPayload2)
      expect(signature1).toBe(signature2)
    })
  })
})
