// Test setup file for Vitest
import { afterAll, beforeAll, vi } from 'vitest'

// Global test setup
beforeAll(() => {
  // Setup global mocks or configurations
})

afterAll(() => {
  // Cleanup after tests
})

// Enhanced WebSocket mock for testing
class MockWebSocket {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3

  public url: string
  public readyState: number = MockWebSocket.CONNECTING
  public onopen: ((event: Event) => void) | null = null
  public onclose: ((event: CloseEvent) => void) | null = null
  public onmessage: ((event: MessageEvent) => void) | null = null
  public onerror: ((event: Event) => void) | null = null

  constructor(url: string) {
    this.url = url
    // Don't auto-connect - let tests control when connection opens
  }

  send(_data: string | ArrayBuffer | Blob | ArrayBufferView) {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open')
    }
    // Mock sending - we can trigger responses in tests
  }

  close(code?: number, reason?: string) {
    this.readyState = MockWebSocket.CLOSING
    setTimeout(() => {
      this.readyState = MockWebSocket.CLOSED
      if (this.onclose) {
        this.onclose(new CloseEvent('close', { code, reason }))
      }
    }, 0)
  }

  addEventListener(type: string, listener: EventListener) {
    if (type === 'open') this.onopen = listener as any
    if (type === 'close') this.onclose = listener as any
    if (type === 'message') this.onmessage = listener as any
    if (type === 'error') this.onerror = listener as any
  }

  removeEventListener(type: string, _listener: EventListener) {
    if (type === 'open') this.onopen = null
    if (type === 'close') this.onclose = null
    if (type === 'message') this.onmessage = null
    if (type === 'error') this.onerror = null
  }

  // Test helper methods
  simulateConnect() {
    this.readyState = MockWebSocket.OPEN
    if (this.onopen) {
      this.onopen(new Event('open'))
    }
  }

  simulateClose() {
    this.readyState = MockWebSocket.CLOSED
    if (this.onclose) {
      this.onclose(new CloseEvent('close'))
    }
  }

  simulateMessage(data: any) {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { data: JSON.stringify(data) }))
    }
  }

  simulateError() {
    if (this.onerror) {
      this.onerror(new Event('error'))
    }
  }
}

global.WebSocket = MockWebSocket as any

// Enhanced fetch mock for testing
global.fetch = vi.fn(async () => {
  // Default successful response
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
})

// Mock btoa/atob for base64 encoding
global.btoa = vi.fn((str: string) => Buffer.from(str).toString('base64'))
global.atob = vi.fn((str: string) => Buffer.from(str, 'base64').toString())
