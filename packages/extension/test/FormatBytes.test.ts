import { expect, test } from '@jest/globals'
import { formatBytes } from '../src/parts/FormatBytes/FormatBytes.ts'

test.each([
  [0, '0 B'],
  [512, '512 B'],
  [1536, '1.5 kB'],
  [12 * 1024 * 1024, '12 MB'],
  [NaN, '0 B'],
])('formats %s bytes as %s', (size, expected) => {
  expect(formatBytes(size)).toBe(expected)
})
