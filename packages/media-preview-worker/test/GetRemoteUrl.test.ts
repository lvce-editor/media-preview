import { expect, test } from '@jest/globals'
import * as GetRemoteUrl from '../src/parts/GetRemoteUrl/GetRemoteUrl.ts'

test.each([
  ['file.png', '/remote/file.png'],
  ['/workspace/file.png', '/remote/workspace/file.png'],
  ['https://example.com/file.png', 'https://example.com/file.png'],
])('getRemoteUrl(%s)', (uri, expected) => {
  expect(GetRemoteUrl.getRemoteUrl(uri)).toBe(expected)
})
