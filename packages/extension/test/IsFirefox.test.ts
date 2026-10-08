import { afterEach, expect, test } from '@jest/globals'
import * as IsFirefox from '../src/parts/IsFirefox/IsFirefox.ts'

const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator')

const setNavigator = (navigator: unknown): void => {
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: navigator,
  })
}

afterEach(() => {
  if (originalNavigator) {
    Object.defineProperty(globalThis, 'navigator', originalNavigator)
  } else {
    delete (globalThis as { navigator?: unknown }).navigator
  }
})

test('returns false when navigator is unavailable', () => {
  setNavigator(undefined)

  expect(IsFirefox.getIsFirefox()).toBe(false)
})

test('uses user agent brands when available', () => {
  setNavigator({ userAgentData: { brands: ['Firefox'] } })

  expect(IsFirefox.getIsFirefox()).toBe(true)
})

test('falls back to the user agent when brands are unavailable', () => {
  setNavigator({ userAgent: 'Mozilla Firefox', userAgentData: {} })

  expect(IsFirefox.getIsFirefox()).toBe(true)
})
