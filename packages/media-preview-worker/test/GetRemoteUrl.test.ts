import { expect, test } from '@jest/globals'
import * as GetRemoteUrl from '../src/parts/GetRemoteUrl/GetRemoteUrl.ts'

test('commandMap', () => {
  const url = 'file.png'
  expect(GetRemoteUrl.getRemoteUrl(url)).toBe('/remote/file.png')
})
