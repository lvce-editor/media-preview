import type { ConvertedImage, ImageConversionOptions, ImageSource, ImageTier } from '../ImageSource/ImageSource.ts'

type ConvertHeicToPreview = (heic: Blob, tier: ImageTier, options: ImageConversionOptions) => Promise<ConvertedImage>
type CreateObjectUrl = (blob: Blob) => string
type GetFileHash = (uri: string) => Promise<string>
type GetPreference = (key: string) => Promise<unknown>
type GetCacheStorageItem = (
  key: string,
) => Promise<{ readonly blob: Blob; readonly headers: Readonly<Record<string, string>> } | null>
type SetCacheStorageItem = (key: string, blob: Blob, headers: Readonly<Record<string, string>>) => Promise<unknown>
type ReadFileAsBlob = (uri: string) => Promise<Blob>

export interface ConvertHeicToPreviewUrlDependencies {
  readonly convert: ConvertHeicToPreview
  readonly createUrl: CreateObjectUrl
  readonly getCacheItem: GetCacheStorageItem
  readonly getHash: GetFileHash
  readonly getSetting: GetPreference
  readonly readBlob: ReadFileAsBlob
  readonly setCacheItem: SetCacheStorageItem
}

interface ReadonlyHeaders {
  readonly get: (name: string) => string | null
}

// Keep v3 keys stable inside the new extension namespace. Old global v1-v3 entries are ignored and left for browser eviction.
const CacheKeyPrefix = 'https://media-preview-cache.invalid/heic-preview/v3/'
const CachingEnabledSetting = 'mediaPreview.cachingEnabled'
const ContentLengthHeader = 'Content-Length'
const HeightHeader = 'X-Media-Preview-Height'
const OriginalHeightHeader = 'X-Media-Preview-Original-Height'
const OriginalWidthHeader = 'X-Media-Preview-Original-Width'
const WidthHeader = 'X-Media-Preview-Width'

const getCacheKey = (hash: string, tier: ImageTier, options: ImageConversionOptions): string => {
  const tierName = tier === 'preview' ? `preview-${options.previewMaxDimension}` : 'full'
  return `${CacheKeyPrefix}${encodeURIComponent(hash)}/${tierName}-quality-${options.webpQuality}.webp`
}

const parsePositiveInteger = (value: string | null): number => {
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 0
}

const getMetadata = (headers: ReadonlyHeaders, tier: ImageTier): Omit<ConvertedImage, 'blob'> | undefined => {
  const height = parsePositiveInteger(headers.get(HeightHeader))
  const originalHeight = parsePositiveInteger(headers.get(OriginalHeightHeader))
  const originalWidth = parsePositiveInteger(headers.get(OriginalWidthHeader))
  const width = parsePositiveInteger(headers.get(WidthHeader))
  if (!height || !originalHeight || !originalWidth || !width || height > originalHeight || width > originalWidth) {
    return undefined
  }
  if (tier === 'full' && (height !== originalHeight || width !== originalWidth)) {
    return undefined
  }
  return { height, originalHeight, originalWidth, width }
}

const getCachedImage = async (
  getCacheItem: GetCacheStorageItem,
  key: string,
  tier: ImageTier,
): Promise<ConvertedImage | undefined> => {
  try {
    const item = await getCacheItem(key)
    if (!item) {
      return undefined
    }
    const headers = new Headers(item.headers)
    const metadata = getMetadata(headers, tier)
    const contentLength = parsePositiveInteger(headers.get(ContentLengthHeader))
    if (!metadata || !contentLength || item.blob.size !== contentLength) {
      return undefined
    }
    return { blob: item.blob, ...metadata }
  } catch {
    return undefined
  }
}

const getFileHashForCache = async (uri: string, getHash: GetFileHash): Promise<string> => {
  try {
    return await getHash(uri)
  } catch {
    return ''
  }
}

const putCachedImage = async (setCacheItem: SetCacheStorageItem, key: string, image: Readonly<ConvertedImage>): Promise<void> => {
  try {
    await setCacheItem(key, image.blob, {
      'Content-Type': image.blob.type,
      [ContentLengthHeader]: String(image.blob.size),
      [HeightHeader]: String(image.height),
      [OriginalHeightHeader]: String(image.originalHeight),
      [OriginalWidthHeader]: String(image.originalWidth),
      [WidthHeader]: String(image.width),
    })
  } catch {
    // Caching is best-effort; the converted image can still be displayed.
  }
}

const toImageSource = (image: Readonly<ConvertedImage>, tier: ImageTier, createUrl: CreateObjectUrl): ImageSource => ({
  height: image.height,
  isFullResolution: tier === 'full' || (image.width === image.originalWidth && image.height === image.originalHeight),
  originalHeight: image.originalHeight,
  originalWidth: image.originalWidth,
  owned: true,
  tier,
  url: createUrl(image.blob),
  width: image.width,
})

export const convertHeicToPreviewUrlWithDependencies = async (
  uri: string,
  tier: ImageTier,
  options: ImageConversionOptions,
  dependencies: ConvertHeicToPreviewUrlDependencies,
): Promise<ImageSource> => {
  const { convert, createUrl, getCacheItem, getHash, getSetting, readBlob, setCacheItem } = dependencies
  const cachingEnabled = (await getSetting(CachingEnabledSetting)) === true
  if (!cachingEnabled) {
    const heic = await readBlob(uri)
    return toImageSource(await convert(heic, tier, options), tier, createUrl)
  }

  const hash = await getFileHashForCache(uri, getHash)
  const cacheKey = hash ? getCacheKey(hash, tier, options) : ''
  const cachedImage = cacheKey ? await getCachedImage(getCacheItem, cacheKey, tier) : undefined
  if (cachedImage) {
    return toImageSource(cachedImage, tier, createUrl)
  }

  const heic = await readBlob(uri)
  const image = await convert(heic, tier, options)
  if (cacheKey) {
    await putCachedImage(setCacheItem, cacheKey, image)
  }
  return toImageSource(image, tier, createUrl)
}
