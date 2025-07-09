// Test setup file for Vitest
import { afterAll, beforeAll } from 'vitest'

// Global test setup
beforeAll(() => {
  // Setup global mocks or configurations
})

afterAll(() => {
  // Cleanup after tests
})

// Mock WebSocket for testing
global.WebSocket = class MockWebSocket {
  constructor(url: string) {
    // Mock WebSocket implementation for tests
  }
  
  send() {}
  close() {}
  addEventListener() {}
  removeEventListener() {}
} as any

// Mock fetch for testing
global.fetch = async () => {
  return new Response('{}', {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}
