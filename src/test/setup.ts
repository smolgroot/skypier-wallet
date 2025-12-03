import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock WebAuthn API
Object.defineProperty(global.navigator, 'credentials', {
  value: {
    create: async () => null,
    get: async () => null,
    preventSilentAccess: async () => undefined,
    store: async () => undefined,
  },
  writable: true,
  configurable: true,
})

// Mock window.crypto if needed
if (typeof window !== 'undefined' && !window.crypto) {
  Object.defineProperty(window, 'crypto', {
    value: {
      getRandomValues: (arr: Uint8Array) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256)
        }
        return arr
      },
      subtle: {} as SubtleCrypto,
    },
  })
}
