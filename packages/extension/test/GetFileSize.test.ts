import { beforeEach, expect, jest, test } from '@jest/globals'
import { getFileSizeWithDependency } from '../src/parts/GetFileSize/GetFileSize.ts'

const readFileAsBlob = jest.fn<(uri: string) => Promise<Blob>>()

beforeEach(() => {
  jest.resetAllMocks()
})

test('returns the blob byte size', async () => {
  readFileAsBlob.mockResolvedValue(new Blob(['hello']))

  await expect(getFileSizeWithDependency('file:///workspace/image.png', readFileAsBlob)).resolves.toBe(5)
  expect(readFileAsBlob).toHaveBeenCalledWith('file:///workspace/image.png')
})

test('returns zero when the image cannot be read', async () => {
  readFileAsBlob.mockRejectedValue(new Error('File not found'))

  await expect(getFileSizeWithDependency('file:///workspace/missing.png', readFileAsBlob)).resolves.toBe(0)
})
