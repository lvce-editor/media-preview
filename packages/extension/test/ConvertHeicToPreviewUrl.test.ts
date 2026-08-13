import { beforeEach, expect, jest, test } from '@jest/globals'
import { convertHeicToPreviewUrlWithDependencies } from '../src/parts/ConvertHeicToPreviewUrl/ConvertHeicToPreviewUrl.ts'

type ImageTier = 'full' | 'preview'

const uri = 'file:///workspace/image.heic'
const hash = 'sha256-image-hash'
const cacheKeyPrefix = `https://media-preview-cache.invalid/heic-preview/v2/${hash}`
const heic = new Blob(['heic'], { type: 'image/heic' })
const preview = new Blob(['preview'], { type: 'image/webp' })
const convertedPreview = {
  blob: preview,
  height: 1536,
  originalHeight: 3072,
  originalWidth: 4096,
  width: 2048,
}
const convert = jest.fn<(blob: Blob, tier: ImageTier) => Promise<typeof convertedPreview>>()
const createObjectUrl = jest.fn<(blob: Blob) => string>()
const getHash = jest.fn<(uri: string) => Promise<string>>()
const getSetting = jest.fn<(key: string) => Promise<unknown>>()
const readFileAsBlob = jest.fn<(uri: string) => Promise<Blob>>()

const createCachedResponse = (
  blob: Blob,
  metadata: Readonly<{
    height: number
    originalHeight: number
    originalWidth: number
    width: number
  }>,
): Response => {
  return new Response(blob, {
    headers: {
      'Content-Length': String(blob.size),
      'X-Media-Preview-Height': String(metadata.height),
      'X-Media-Preview-Original-Height': String(metadata.originalHeight),
      'X-Media-Preview-Original-Width': String(metadata.originalWidth),
      'X-Media-Preview-Width': String(metadata.width),
    },
  })
}

const createMemoryCacheStorage = (
  initialValues: Readonly<Record<string, Response>> = {},
): {
  readonly cacheStorage: CacheStorage
  readonly deletedCacheNames: readonly string[]
  readonly putKeys: readonly string[]
  readonly putResponses: readonly Response[]
} => {
  const values = new Map<string, Response>(Object.entries(initialValues))
  const deletedCacheNames: string[] = []
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
    async delete(name: string): Promise<boolean> {
      deletedCacheNames.push(name)
      return true
    },
    async open(name: string): Promise<Cache> {
      expect(name).toBe('builtin.media-preview.heic-preview-v2')
      return cache
    },
  } as unknown as CacheStorage
  return { cacheStorage, deletedCacheNames, putKeys, putResponses }
}

beforeEach(() => {
  jest.resetAllMocks()
  convert.mockResolvedValue(convertedPreview)
  createObjectUrl.mockReturnValue('blob:https://example.com/preview-id')
  getHash.mockResolvedValue(hash)
  readFileAsBlob.mockResolvedValue(heic)
})

test('converts without querying the hash or cache when caching is disabled', async () => {
  getSetting.mockResolvedValue(false)
  const { cacheStorage, deletedCacheNames, putKeys } = createMemoryCacheStorage()

  await expect(
    convertHeicToPreviewUrlWithDependencies(uri, 'preview', {
      cacheStorage,
      convert,
      createUrl: createObjectUrl,
      getHash,
      getSetting,
      readBlob: readFileAsBlob,
    }),
  ).resolves.toEqual({
    height: 1536,
    isFullResolution: false,
    originalHeight: 3072,
    originalWidth: 4096,
    owned: true,
    tier: 'preview',
    url: 'blob:https://example.com/preview-id',
    width: 2048,
  })

  expect(getSetting).toHaveBeenCalledWith('mediaPreview.cachingEnabled')
  expect(getHash).not.toHaveBeenCalled()
  expect(putKeys).toEqual([])
  expect(deletedCacheNames).toEqual([])
  expect(readFileAsBlob).toHaveBeenCalledWith(uri)
  expect(convert).toHaveBeenCalledWith(heic, 'preview')
  expect(createObjectUrl).toHaveBeenCalledWith(preview)
})

test.each([
  ['preview', `${cacheKeyPrefix}/preview-2048.webp`],
  ['full', `${cacheKeyPrefix}/full.webp`],
] as const)('uses the cached %s tier without decoding the image', async (tier, cacheKey) => {
  getSetting.mockResolvedValue(true)
  const cachedPreview = new Blob(['cached preview'], { type: 'image/webp' })
  const cachedMetadata =
    tier === 'full'
      ? { ...convertedPreview, height: convertedPreview.originalHeight, width: convertedPreview.originalWidth }
      : convertedPreview
  const { cacheStorage, deletedCacheNames, putKeys } = createMemoryCacheStorage({
    [cacheKey]: createCachedResponse(cachedPreview, cachedMetadata),
  })

  const result = await convertHeicToPreviewUrlWithDependencies(uri, tier, {
    cacheStorage,
    convert,
    createUrl: createObjectUrl,
    getHash,
    getSetting,
    readBlob: readFileAsBlob,
  })

  expect(result).toEqual({
    height: cachedMetadata.height,
    isFullResolution: tier === 'full',
    originalHeight: 3072,
    originalWidth: 4096,
    owned: true,
    tier,
    url: 'blob:https://example.com/preview-id',
    width: cachedMetadata.width,
  })
  expect(getHash).toHaveBeenCalledWith(uri)
  expect(readFileAsBlob).not.toHaveBeenCalled()
  expect(convert).not.toHaveBeenCalled()
  expect(putKeys).toEqual([])
  expect(deletedCacheNames).toEqual(['builtin.media-preview.heic-preview-v1'])
  expect(await createObjectUrl.mock.calls[0][0].text()).toBe('cached preview')
})

test.each([
  ['preview', `${cacheKeyPrefix}/preview-2048.webp`],
  ['full', `${cacheKeyPrefix}/full.webp`],
] as const)('converts and caches the %s tier after a cache miss', async (tier, cacheKey) => {
  getSetting.mockResolvedValue(true)
  const { cacheStorage, putKeys, putResponses } = createMemoryCacheStorage()

  await convertHeicToPreviewUrlWithDependencies(uri, tier, {
    cacheStorage,
    convert,
    createUrl: createObjectUrl,
    getHash,
    getSetting,
    readBlob: readFileAsBlob,
  })

  expect(getHash).toHaveBeenCalledWith(uri)
  expect(readFileAsBlob).toHaveBeenCalledWith(uri)
  expect(getHash.mock.invocationCallOrder[0]).toBeLessThan(readFileAsBlob.mock.invocationCallOrder[0])
  expect(convert).toHaveBeenCalledWith(heic, tier)
  expect(putKeys).toEqual([cacheKey])
  expect(putResponses).toHaveLength(1)
  expect(putResponses[0].headers.get('Content-Length')).toBe(String(preview.size))
  expect(putResponses[0].headers.get('X-Media-Preview-Original-Width')).toBe('4096')
  expect(putResponses[0].headers.get('X-Media-Preview-Original-Height')).toBe('3072')
  expect(putResponses[0].headers.get('X-Media-Preview-Width')).toBe('2048')
  expect(putResponses[0].headers.get('X-Media-Preview-Height')).toBe('1536')
})

test('ignores cached entries with invalid metadata', async () => {
  getSetting.mockResolvedValue(true)
  const cacheKey = `${cacheKeyPrefix}/preview-2048.webp`
  const invalidResponse = createCachedResponse(preview, {
    ...convertedPreview,
    width: NaN,
  })
  const { cacheStorage, putKeys } = createMemoryCacheStorage({
    [cacheKey]: invalidResponse,
  })

  await convertHeicToPreviewUrlWithDependencies(uri, 'preview', {
    cacheStorage,
    convert,
    createUrl: createObjectUrl,
    getHash,
    getSetting,
    readBlob: readFileAsBlob,
  })

  expect(readFileAsBlob).toHaveBeenCalledWith(uri)
  expect(convert).toHaveBeenCalledWith(heic, 'preview')
  expect(putKeys).toEqual([cacheKey])
})

test('still uses cache v2 when deleting cache v1 fails', async () => {
  getSetting.mockResolvedValue(true)
  const { cacheStorage } = createMemoryCacheStorage()
  jest.spyOn(cacheStorage, 'delete').mockRejectedValue(new Error('cannot delete cache'))

  await expect(
    convertHeicToPreviewUrlWithDependencies(uri, 'preview', {
      cacheStorage,
      convert,
      createUrl: createObjectUrl,
      getHash,
      getSetting,
      readBlob: readFileAsBlob,
    }),
  ).resolves.toMatchObject({ tier: 'preview' })
})

test('falls back to conversion when Cache Storage is unavailable', async () => {
  getSetting.mockResolvedValue(true)

  await expect(
    convertHeicToPreviewUrlWithDependencies(uri, 'preview', {
      cacheStorage: undefined,
      convert,
      createUrl: createObjectUrl,
      getHash,
      getSetting,
      readBlob: readFileAsBlob,
    }),
  ).resolves.toMatchObject({ tier: 'preview' })

  expect(getHash).toHaveBeenCalledWith(uri)
  expect(readFileAsBlob).toHaveBeenCalledWith(uri)
  expect(convert).toHaveBeenCalledWith(heic, 'preview')
})

test('falls back to uncached conversion when hashing fails', async () => {
  getSetting.mockResolvedValue(true)
  getHash.mockRejectedValue(new Error('hashing unavailable'))
  const { cacheStorage, putKeys } = createMemoryCacheStorage()

  await convertHeicToPreviewUrlWithDependencies(uri, 'preview', {
    cacheStorage,
    convert,
    createUrl: createObjectUrl,
    getHash,
    getSetting,
    readBlob: readFileAsBlob,
  })

  expect(convert).toHaveBeenCalledWith(heic, 'preview')
  expect(putKeys).toEqual([])
})

test('falls back to conversion when opening cache v2 fails', async () => {
  getSetting.mockResolvedValue(true)
  const { cacheStorage } = createMemoryCacheStorage()
  jest.spyOn(cacheStorage, 'open').mockRejectedValue(new Error('cache unavailable'))

  await expect(
    convertHeicToPreviewUrlWithDependencies(uri, 'preview', {
      cacheStorage,
      convert,
      createUrl: createObjectUrl,
      getHash,
      getSetting,
      readBlob: readFileAsBlob,
    }),
  ).resolves.toMatchObject({ url: 'blob:https://example.com/preview-id' })
})

test('ignores full-tier cache entries that are not full size', async () => {
  getSetting.mockResolvedValue(true)
  const cacheKey = `${cacheKeyPrefix}/full.webp`
  const { cacheStorage, putKeys } = createMemoryCacheStorage({
    [cacheKey]: createCachedResponse(preview, convertedPreview),
  })

  await convertHeicToPreviewUrlWithDependencies(uri, 'full', {
    cacheStorage,
    convert,
    createUrl: createObjectUrl,
    getHash,
    getSetting,
    readBlob: readFileAsBlob,
  })

  expect(convert).toHaveBeenCalledWith(heic, 'full')
  expect(putKeys).toEqual([cacheKey])
})

test('ignores cached blobs whose content length does not match', async () => {
  getSetting.mockResolvedValue(true)
  const cacheKey = `${cacheKeyPrefix}/preview-2048.webp`
  const response = createCachedResponse(preview, convertedPreview)
  response.headers.set('Content-Length', String(preview.size + 1))
  const { cacheStorage, putKeys } = createMemoryCacheStorage({ [cacheKey]: response })

  await convertHeicToPreviewUrlWithDependencies(uri, 'preview', {
    cacheStorage,
    convert,
    createUrl: createObjectUrl,
    getHash,
    getSetting,
    readBlob: readFileAsBlob,
  })

  expect(putKeys).toEqual([cacheKey])
})

test('marks an uncapped preview as already full resolution', async () => {
  getSetting.mockResolvedValue(false)
  convert.mockResolvedValue({
    blob: preview,
    height: 768,
    originalHeight: 768,
    originalWidth: 1024,
    width: 1024,
  })

  await expect(
    convertHeicToPreviewUrlWithDependencies(uri, 'preview', {
      cacheStorage: undefined,
      convert,
      createUrl: createObjectUrl,
      getHash,
      getSetting,
      readBlob: readFileAsBlob,
    }),
  ).resolves.toMatchObject({ isFullResolution: true })
})
