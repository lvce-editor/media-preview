import { beforeEach, expect, jest, test } from '@jest/globals'
import { getFileSizeWithDependencies } from '../src/parts/GetFileSize/GetFileSize.ts'

const readAsObjectUrl = jest.fn<(uri: string) => Promise<{ error: string; objectUrl: string; wasFound: boolean }>>()
const fetch = jest.fn<(url: string) => Promise<Response>>()

beforeEach(() => {
  jest.resetAllMocks()
})

test('returns the resolved image byte size', async () => {
  readAsObjectUrl.mockResolvedValue({ error: '', objectUrl: '/remote/workspace/Pasted image.png', wasFound: true })
  fetch.mockResolvedValue(new Response('hello'))

  await expect(
    getFileSizeWithDependencies('/workspace/Pasted image.png', readAsObjectUrl, fetch, 'https://example.com'),
  ).resolves.toBe(5)
  expect(readAsObjectUrl).toHaveBeenCalledWith('/workspace/Pasted image.png')
  expect(fetch).toHaveBeenCalledWith('https://example.com/remote/workspace/Pasted image.png')
})

test('preserves an absolute resolved image URL', async () => {
  readAsObjectUrl.mockResolvedValue({ error: '', objectUrl: 'blob:https://example.com/image-id', wasFound: true })
  fetch.mockResolvedValue(new Response('hello'))

  await expect(getFileSizeWithDependencies('memfs:///image.png', readAsObjectUrl, fetch, 'https://example.com')).resolves.toBe(5)
  expect(fetch).toHaveBeenCalledWith('blob:https://example.com/image-id')
})

test('returns zero when the image URL cannot be resolved', async () => {
  readAsObjectUrl.mockResolvedValue({ error: 'File not found', objectUrl: '', wasFound: false })

  await expect(
    getFileSizeWithDependencies('/workspace/missing.png', readAsObjectUrl, fetch, 'https://example.com'),
  ).resolves.toBe(0)
  expect(fetch).not.toHaveBeenCalled()
})

test('returns zero when the image response is not ok', async () => {
  readAsObjectUrl.mockResolvedValue({ error: '', objectUrl: '/remote/workspace/missing.png', wasFound: true })
  fetch.mockResolvedValue(new Response('', { status: 404 }))

  await expect(
    getFileSizeWithDependencies('/workspace/missing.png', readAsObjectUrl, fetch, 'https://example.com'),
  ).resolves.toBe(0)
})

test('returns zero when the image response cannot be read', async () => {
  readAsObjectUrl.mockResolvedValue({ error: '', objectUrl: '/remote/workspace/missing.png', wasFound: true })
  fetch.mockRejectedValue(new Error('File not found'))

  await expect(
    getFileSizeWithDependencies('/workspace/missing.png', readAsObjectUrl, fetch, 'https://example.com'),
  ).resolves.toBe(0)
})
