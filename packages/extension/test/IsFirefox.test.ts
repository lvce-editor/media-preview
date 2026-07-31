import { afterEach, expect, jest, test } from '@jest/globals'

const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator')

const setNavigator = (navigator: unknown): void => {
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: navigator,
  })
}

const loadIsFirefox = async (): Promise<boolean> => {
  jest.resetModules()
  const module = await import('../src/parts/IsFirefox/IsFirefox.ts')
  return module.isFirefox
}

afterEach(() => {
  if (originalNavigator) {
    Object.defineProperty(globalThis, 'navigator', originalNavigator)
  } else {
    delete (globalThis as { navigator?: unknown }).navigator
  }
})

test('returns false when navigator is unavailable', async () => {
  setNavigator(undefined)

  await expect(loadIsFirefox()).resolves.toBe(false)
})

test('uses user agent brands when available', async () => {
  setNavigator({ userAgentData: { brands: ['Firefox'] } })

  await expect(loadIsFirefox()).resolves.toBe(true)
})

test('falls back to the user agent when brands are unavailable', async () => {
  setNavigator({ userAgent: 'Mozilla Firefox', userAgentData: {} })

  await expect(loadIsFirefox()).resolves.toBe(true)
})
