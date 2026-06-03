import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'

// jsdom in this version exposes a plain `{}` for window.localStorage; provide a
// minimal Storage-like polyfill so tests can exercise auth state.
function makeLocalStorage(): Storage {
  const store = new Map<string, string>()
  return {
    get length() { return store.size },
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => { store.set(k, String(v)) },
    removeItem: (k: string) => { store.delete(k) },
    clear: () => { store.clear() },
  } as Storage
}

if (typeof window !== 'undefined' && typeof window.localStorage?.getItem !== 'function') {
  Object.defineProperty(window, 'localStorage', { value: makeLocalStorage(), configurable: true })
}

// jsdom does not implement IntersectionObserver — provide a no-op stub so
// components using infinite-scroll sentinels can render in tests.
if (typeof globalThis.IntersectionObserver === 'undefined') {
  class IntersectionObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return [] }
    root = null
    rootMargin = ''
    thresholds: number[] = []
  }
  globalThis.IntersectionObserver = IntersectionObserverStub
}

// jsdom does not implement scrollIntoView
if (typeof Element.prototype.scrollIntoView === 'undefined') {
  Element.prototype.scrollIntoView = () => {}
}

beforeEach(() => {
  try { window.localStorage.clear() } catch { /* ignore */ }
})

afterEach(() => {
  cleanup()
})