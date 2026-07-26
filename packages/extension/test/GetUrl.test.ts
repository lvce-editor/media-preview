import type { ReadAsObjectUrlResult } from '@lvce-editor/api'
import { expect, jest, test } from '@jest/globals'
import * as GetUrl from '../src/parts/GetUrl/GetUrl.ts'

const readAsObjectUrl = jest.fn<(uri: string) => Promise<ReadAsObjectUrlResult>>()

test('returns the object URL when the file was found', async () => {
  readAsObjectUrl.mockResolvedValue({
    error: '',
    objectUrl: 'blob:https://example.com/image-id',
    wasFound: true,
  })

  await expect(GetUrl.getUrl('html:///workspace/image.png', readAsObjectUrl)).resolves.toBe('blob:https://example.com/image-id')
  expect(readAsObjectUrl).toHaveBeenCalledWith('html:///workspace/image.png')
})

test('returns an empty URL when the file could not be read', async () => {
  readAsObjectUrl.mockResolvedValue({
    error: 'File not found',
    objectUrl: '',
    wasFound: false,
  })

  await expect(GetUrl.getUrl('html:///workspace/missing.png', readAsObjectUrl)).resolves.toBe('')
})
