import { beforeEach, expect, jest, test } from '@jest/globals'
import type { ConvertHeicToPreviewUrlDependencies } from '../src/parts/ConvertHeicToPreviewUrl/ConvertHeicToPreviewUrlCore.ts'
import { convertHeicToPreviewUrlWithDependencies } from '../src/parts/ConvertHeicToPreviewUrl/ConvertHeicToPreviewUrlCore.ts'

type ImageTier = 'full' | 'preview'

const uri = 'file:///workspace/image.heic'
const hash = 'sha256-image-hash'
const cacheKeyPrefix = `https://media-preview-cache.invalid/heic-preview/v3/${hash}`
const heic = new Blob(['heic'], { type: 'image/heic' })
const preview = new Blob(['preview'], { type: 'image/webp' })
const convertedPreview = { blob: preview, height: 1536, originalHeight: 3072, originalWidth: 4096, width: 2048 }
const options = { previewMaxDimension: 2048, webpQuality: 0.9 }
type ConversionOptions = typeof options
interface CacheItem {
  readonly blob: Blob
  readonly headers: Readonly<Record<string, string>>
  readonly status: number
  readonly statusText: string
}
interface CacheAccessors {
  readonly getCacheItem: (key: string) => Promise<CacheItem | null>
  readonly setCacheItem: (key: string, blob: Blob, headers?: Readonly<Record<string, string>>) => Promise<unknown>
}

const convert = jest.fn<(blob: Blob, tier: ImageTier, options: Readonly<ConversionOptions>) => Promise<typeof convertedPreview>>()
const createObjectUrl = jest.fn<(blob: Blob) => string>()
const getHash = jest.fn<(uri: string) => Promise<string>>()
const getSetting = jest.fn<(key: string) => Promise<unknown>>()
const readFileAsBlob = jest.fn<(uri: string) => Promise<Blob>>()

const createCache = (
  initial: Readonly<Record<string, CacheItem>> = {},
): {
  readonly getCacheItem: ReturnType<typeof jest.fn<(key: string) => Promise<CacheItem | null>>>
  readonly putItems: CacheItem[]
  readonly putKeys: string[]
  readonly setCacheItem: ReturnType<
    typeof jest.fn<(key: string, blob: Blob, headers?: Readonly<Record<string, string>>) => Promise<{ readonly success: true }>>
  >
} => {
  const values = new Map(Object.entries(initial))
  const putKeys: string[] = []
  const putItems: CacheItem[] = []
  const getCacheItem = jest.fn(async (key: string): Promise<CacheItem | null> => values.get(key) || null)
  const setCacheItem = jest.fn(
    async (key: string, blob: Blob, headers: Readonly<Record<string, string>> = {}): Promise<{ readonly success: true }> => {
      const item = { blob, headers: Object.fromEntries(new Headers(headers).entries()), status: 200, statusText: 'OK' }
      putKeys.push(key)
      putItems.push(item)
      values.set(key, item)
      return { success: true as const }
    },
  )
  return { getCacheItem, putItems, putKeys, setCacheItem }
}

const createCachedItem = (
  blob: Blob,
  metadata: Readonly<{ height: number; originalHeight: number; originalWidth: number; width: number }>,
  length = blob.size,
): CacheItem => ({
  blob,
  headers: {
    'Content-Length': String(length),
    'Content-Type': blob.type,
    'X-Media-Preview-Height': String(metadata.height),
    'X-Media-Preview-Original-Height': String(metadata.originalHeight),
    'X-Media-Preview-Original-Width': String(metadata.originalWidth),
    'X-Media-Preview-Width': String(metadata.width),
  },
  status: 200,
  statusText: 'OK',
})

const createDependencies = (cache: CacheAccessors): ConvertHeicToPreviewUrlDependencies => ({
  convert,
  createUrl: createObjectUrl,
  getCacheItem: cache.getCacheItem,
  getHash,
  getSetting,
  readBlob: readFileAsBlob,
  setCacheItem: cache.setCacheItem,
})

beforeEach((): void => {
  jest.resetAllMocks()
  convert.mockResolvedValue(convertedPreview)
  createObjectUrl.mockReturnValue('blob:https://example.com/preview-id')
  getHash.mockResolvedValue(hash)
  readFileAsBlob.mockResolvedValue(heic)
})

test('does not access cache or hash when caching is disabled', async () => {
  getSetting.mockResolvedValue(false)
  const cache = createCache()
  await expect(
    convertHeicToPreviewUrlWithDependencies(uri, 'preview', options, createDependencies(cache)),
  ).resolves.toMatchObject({
    tier: 'preview',
    url: 'blob:https://example.com/preview-id',
  })
  expect(getHash).not.toHaveBeenCalled()
  expect(cache.getCacheItem).not.toHaveBeenCalled()
  expect(cache.setCacheItem).not.toHaveBeenCalled()
  expect(convert).toHaveBeenCalledWith(heic, 'preview', options)
})

test.each([
  ['preview', `${cacheKeyPrefix}/preview-2048-quality-0.9.webp`],
  ['full', `${cacheKeyPrefix}/full-quality-0.9.webp`],
] as const)('reuses the cached %s tier', async (tier, cacheKey) => {
  getSetting.mockResolvedValue(true)
  const cachedBlob = new Blob(['cached'], { type: 'image/webp' })
  const metadata = tier === 'full' ? { ...convertedPreview, height: 3072, width: 4096 } : convertedPreview
  const cache = createCache({ [cacheKey]: createCachedItem(cachedBlob, metadata) })
  await convertHeicToPreviewUrlWithDependencies(uri, tier, options, createDependencies(cache))
  expect(cache.getCacheItem).toHaveBeenCalledWith(cacheKey)
  expect(readFileAsBlob).not.toHaveBeenCalled()
  expect(convert).not.toHaveBeenCalled()
  expect(createObjectUrl).toHaveBeenCalledWith(cachedBlob)
})

test.each([
  ['preview', `${cacheKeyPrefix}/preview-2048-quality-0.9.webp`],
  ['full', `${cacheKeyPrefix}/full-quality-0.9.webp`],
] as const)('converts and stores a missed %s tier with metadata and MIME type', async (tier, cacheKey) => {
  getSetting.mockResolvedValue(true)
  const cache = createCache()
  await convertHeicToPreviewUrlWithDependencies(uri, tier, options, createDependencies(cache))
  expect(convert).toHaveBeenCalledWith(heic, tier, options)
  expect(cache.putKeys).toEqual([cacheKey])
  expect(cache.putItems[0].blob).toBe(preview)
  expect(cache.putItems[0].headers['content-type']).toBe('image/webp')
  expect(cache.putItems[0].headers['content-length']).toBe(String(preview.size))
  expect(cache.putItems[0].headers['x-media-preview-original-width']).toBe('4096')
  expect(cache.putItems[0].headers['x-media-preview-original-height']).toBe('3072')
  expect(cache.putItems[0].headers['x-media-preview-width']).toBe('2048')
  expect(cache.putItems[0].headers['x-media-preview-height']).toBe('1536')
})

test('changed conversion options use a distinct key', async () => {
  getSetting.mockResolvedValue(true)
  const customOptions = { previewMaxDimension: 1024, webpQuality: 0.5 }
  const originalKey = `${cacheKeyPrefix}/preview-2048-quality-0.9.webp`
  const cache = createCache({ [originalKey]: createCachedItem(preview, convertedPreview) })
  await convertHeicToPreviewUrlWithDependencies(uri, 'preview', customOptions, createDependencies(cache))
  expect(convert).toHaveBeenCalledWith(heic, 'preview', customOptions)
  expect(cache.putKeys).toEqual([`${cacheKeyPrefix}/preview-1024-quality-0.5.webp`])
})

test('changed file content hashes use a distinct key', async () => {
  getSetting.mockResolvedValue(true)
  getHash.mockResolvedValue('changed-image-hash')
  const oldKey = `${cacheKeyPrefix}/preview-2048-quality-0.9.webp`
  const newKey = `https://media-preview-cache.invalid/heic-preview/v3/changed-image-hash/preview-2048-quality-0.9.webp`
  const cache = createCache({ [oldKey]: createCachedItem(preview, convertedPreview) })
  await convertHeicToPreviewUrlWithDependencies(uri, 'preview', options, createDependencies(cache))
  expect(cache.getCacheItem).toHaveBeenCalledWith(newKey)
  expect(convert).toHaveBeenCalledWith(heic, 'preview', options)
  expect(cache.putKeys).toEqual([newKey])
})

test.each([
  ['invalid metadata', createCachedItem(preview, { ...convertedPreview, width: NaN })],
  ['incorrect byte length', createCachedItem(preview, convertedPreview, preview.size + 1)],
] as const)('reconverts a cached item with %s', async (_reason, invalidItem) => {
  getSetting.mockResolvedValue(true)
  const cacheKey = `${cacheKeyPrefix}/preview-2048-quality-0.9.webp`
  const cache = createCache({ [cacheKey]: invalidItem })
  await convertHeicToPreviewUrlWithDependencies(uri, 'preview', options, createDependencies(cache))
  expect(readFileAsBlob).toHaveBeenCalledWith(uri)
  expect(convert).toHaveBeenCalledWith(heic, 'preview', options)
  expect(cache.putKeys).toEqual([cacheKey])
})

test('falls back to displaying a converted image when cache reads or writes fail', async () => {
  getSetting.mockResolvedValue(true)
  const cache = createCache()
  cache.getCacheItem.mockRejectedValue(new Error('cache unavailable'))
  cache.setCacheItem.mockRejectedValue(new Error('cache unavailable'))
  await expect(
    convertHeicToPreviewUrlWithDependencies(uri, 'preview', options, createDependencies(cache)),
  ).resolves.toMatchObject({
    tier: 'preview',
    url: 'blob:https://example.com/preview-id',
  })
  expect(convert).toHaveBeenCalledWith(heic, 'preview', options)
})

test('skips cache access when hashing fails and still displays the image', async () => {
  getSetting.mockResolvedValue(true)
  getHash.mockRejectedValue(new Error('hashing unavailable'))
  const cache = createCache()
  await convertHeicToPreviewUrlWithDependencies(uri, 'preview', options, createDependencies(cache))
  expect(cache.getCacheItem).not.toHaveBeenCalled()
  expect(cache.setCacheItem).not.toHaveBeenCalled()
  expect(convert).toHaveBeenCalledWith(heic, 'preview', options)
})

test('rejects a non-full-resolution item for full-resolution requests', async () => {
  getSetting.mockResolvedValue(true)
  const cacheKey = `${cacheKeyPrefix}/full-quality-0.9.webp`
  const cache = createCache({ [cacheKey]: createCachedItem(preview, convertedPreview) })
  await convertHeicToPreviewUrlWithDependencies(uri, 'full', options, createDependencies(cache))
  expect(convert).toHaveBeenCalledWith(heic, 'full', options)
  expect(cache.putKeys).toEqual([cacheKey])
})

test('marks an uncapped preview as already full resolution', async () => {
  getSetting.mockResolvedValue(false)
  convert.mockResolvedValue({ blob: preview, height: 768, originalHeight: 768, originalWidth: 1024, width: 1024 })
  const cache = createCache()
  await expect(
    convertHeicToPreviewUrlWithDependencies(uri, 'preview', options, createDependencies(cache)),
  ).resolves.toMatchObject({ isFullResolution: true })
})
