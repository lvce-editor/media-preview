import { beforeEach, expect, jest, test } from '@jest/globals'
import { convertHeicToPreviewUrlWithDependencies } from '../src/parts/ConvertHeicToPreviewUrl/ConvertHeicToPreviewUrl.ts'

const uri = 'file:///workspace/image.heic'
const hash = 'sha256-image-hash'
const cacheKey = `https://media-preview-cache.invalid/heic-preview/${hash}.webp`
const heic = new Blob(['heic'], { type: 'image/heic' })
const preview = new Blob(['preview'], { type: 'image/webp' })
const convert = jest.fn<(blob: Blob) => Promise<Blob>>()
const createObjectUrl = jest.fn<(blob: Blob) => string>()
const getHash = jest.fn<(uri: string) => Promise<string>>()
const getSetting = jest.fn<(key: string) => Promise<unknown>>()
const readFileAsBlob = jest.fn<(uri: string) => Promise<Blob>>()

const createMemoryCacheStorage = (
  initialValues: Readonly<Record<string, Response>> = {},
): {
  readonly cacheStorage: CacheStorage
  readonly putKeys: readonly string[]
  readonly putResponses: readonly Response[]
} => {
  const values = new Map<string, Response>(Object.entries(initialValues))
  const putKeys: string[] = []
  const putResponses: Response[] = []
  const cache = {
    async match(key: string): Promise<Response | undefined> {
      return values.get(key)?.clone()
    },
    async put(key: string, response: Response): Promise<void> {
      putKeys.push(key)
      putResponses.push(response.clone())
      values.set(key, response.clone())
    },
  } as unknown as Cache
  const cacheStorage = {
    async open(name: string): Promise<Cache> {
      expect(name).toBe('builtin.media-preview.heic-preview-v1')
      return cache
    },
  } as unknown as CacheStorage
  return { cacheStorage, putKeys, putResponses }
}

beforeEach(() => {
  jest.resetAllMocks()
  convert.mockResolvedValue(preview)
  createObjectUrl.mockReturnValue('blob:https://example.com/preview-id')
  getHash.mockResolvedValue(hash)
  readFileAsBlob.mockResolvedValue(heic)
})

test('converts without querying the hash or cache when caching is disabled', async () => {
  getSetting.mockResolvedValue(false)
  const { cacheStorage, putKeys } = createMemoryCacheStorage()

  await expect(
    convertHeicToPreviewUrlWithDependencies(uri, {
      cacheStorage,
      convert,
      createUrl: createObjectUrl,
      getHash,
      getSetting,
      readBlob: readFileAsBlob,
    }),
  ).resolves.toBe('blob:https://example.com/preview-id')

  expect(getSetting).toHaveBeenCalledWith('mediaPreview.cachingEnabled')
  expect(getHash).not.toHaveBeenCalled()
  expect(putKeys).toEqual([])
  expect(readFileAsBlob).toHaveBeenCalledWith(uri)
  expect(convert).toHaveBeenCalledWith(heic)
  expect(createObjectUrl).toHaveBeenCalledWith(preview)
})

test('uses the cached preview before reading the HEIC blob when caching is enabled', async () => {
  getSetting.mockResolvedValue(true)
  const cachedPreview = new Blob(['cached preview'], { type: 'image/webp' })
  const { cacheStorage, putKeys } = createMemoryCacheStorage({
    [cacheKey]: new Response(cachedPreview),
  })

  await expect(
    convertHeicToPreviewUrlWithDependencies(uri, {
      cacheStorage,
      convert,
      createUrl: createObjectUrl,
      getHash,
      getSetting,
      readBlob: readFileAsBlob,
    }),
  ).resolves.toBe('blob:https://example.com/preview-id')

  expect(getHash).toHaveBeenCalledWith(uri)
  expect(readFileAsBlob).not.toHaveBeenCalled()
  expect(convert).not.toHaveBeenCalled()
  expect(putKeys).toEqual([])
  expect(createObjectUrl).toHaveBeenCalledTimes(1)
  expect(await createObjectUrl.mock.calls[0][0].text()).toBe('cached preview')
})

test('converts and caches the preview after a cache miss', async () => {
  getSetting.mockResolvedValue(true)
  const { cacheStorage, putKeys, putResponses } = createMemoryCacheStorage()

  await expect(
    convertHeicToPreviewUrlWithDependencies(uri, {
      cacheStorage,
      convert,
      createUrl: createObjectUrl,
      getHash,
      getSetting,
      readBlob: readFileAsBlob,
    }),
  ).resolves.toBe('blob:https://example.com/preview-id')

  expect(getHash).toHaveBeenCalledWith(uri)
  expect(readFileAsBlob).toHaveBeenCalledWith(uri)
  expect(getHash.mock.invocationCallOrder[0]).toBeLessThan(readFileAsBlob.mock.invocationCallOrder[0])
  expect(convert).toHaveBeenCalledWith(heic)
  expect(putKeys).toEqual([cacheKey])
  expect(putResponses).toHaveLength(1)
  expect(putResponses[0].headers.get('Content-Length')).toBe(String(preview.size))
  expect(createObjectUrl).toHaveBeenCalledWith(preview)
})

test('falls back to conversion when Cache Storage is unavailable', async () => {
  getSetting.mockResolvedValue(true)

  await expect(
    convertHeicToPreviewUrlWithDependencies(uri, {
      cacheStorage: undefined,
      convert,
      createUrl: createObjectUrl,
      getHash,
      getSetting,
      readBlob: readFileAsBlob,
    }),
  ).resolves.toBe('blob:https://example.com/preview-id')

  expect(getHash).toHaveBeenCalledWith(uri)
  expect(readFileAsBlob).toHaveBeenCalledWith(uri)
  expect(convert).toHaveBeenCalledWith(heic)
})
