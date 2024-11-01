import { expect, test } from '@jest/globals'
import * as WheelEvent from '../src/parts/WheelEvent/WheelEvent.ts'

test('normalizeDelta', async () => {
  const delta = 1
  const isFirefox = false
  expect(WheelEvent.normalizeDelta(delta, isFirefox)).toBe(1)
})

test('normalizeDelta - firefox', async () => {
  const delta = 1
  const isFirefox = true
  expect(WheelEvent.normalizeDelta(delta, isFirefox)).toBe(52 / 114)
})
