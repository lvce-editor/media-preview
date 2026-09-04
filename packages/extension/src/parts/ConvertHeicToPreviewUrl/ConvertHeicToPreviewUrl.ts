import { getFileHash, getPreference, readFileAsBlob } from '@lvce-editor/api'
import type { ConvertedImage, ImageSource, ImageTier } from '../ImageSource/ImageSource.ts'
import * as ImageConversionWorker from '../ImageConversionWorker/ImageConversionWorker.ts'

type ConvertHeicToPreview = (heic: Blob, tier: ImageTier) => Promise<ConvertedImage>
type CreateObjectUrl = (blob: Blob) => string
type GetFileHash = (uri: string) => Promise<string>
type GetPreference = (key: string) => Promise<unknown>
type ReadFileAsBlob = (uri: string) => Promise<Blob>

interface ConvertHeicToPreviewUrlDependencies {
  readonly cacheStorage: Readonly<CacheStorage> | undefined
  readonly convert: ConvertHeicToPreview
  readonly createUrl: CreateObjectUrl
  readonly getHash: GetFileHash
  readonly getSetting: GetPreference
  readonly readBlob: ReadFileAsBlob
}

interface ReadonlyHeaders {
  readonly get: (name: string) => string | null
}

const CacheName = 'builtin.media-preview.heic-preview-v2'
const LegacyCacheName = 'builtin.media-preview.heic-preview-v1'
const CacheKeyPrefix = 'https://media-preview-cache.invalid/heic-preview/v2/'
const CachingEnabledSetting = 'mediaPreview.cachingEnabled'
const ContentLengthHeader = 'Content-Length'
const HeightHeader = 'X-Media-Preview-Height'
const OriginalHeightHeader = 'X-Media-Preview-Original-Height'
const OriginalWidthHeader = 'X-Media-Preview-Original-Width'
const WidthHeader = 'X-Media-Preview-Width'

const createObjectUrl = (blob: Blob): string => {
  return URL.createObjectURL(blob)
}

const getCache = async (cacheStorage: Readonly<CacheStorage> | undefined): Promise<Cache | undefined> => {
  if (!cacheStorage) {
    return undefined
  }
  try {
    const cache = await cacheStorage.open(CacheName)
    void cacheStorage.delete(LegacyCacheName).catch(() => {})
    return cache
  } catch {
    return undefined
  }
}

const getCacheKey = (hash: string, tier: ImageTier): string => {
  const tierName = tier === 'preview' ? 'preview-2048' : 'full'
  return `${CacheKeyPrefix}${encodeURIComponent(hash)}/${tierName}.webp`
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
  cache: Readonly<Cache> | undefined,
  key: string,
  tier: ImageTier,
): Promise<ConvertedImage | undefined> => {
  if (!cache) {
    return undefined
  }
  try {
    const response = await cache.match(key)
    if (!response) {
      return undefined
    }
    const metadata = getMetadata(response.headers, tier)
    const contentLength = parsePositiveInteger(response.headers.get(ContentLengthHeader))
    if (!metadata || !contentLength) {
      return undefined
    }
    const blob = await response.blob()
    if (blob.size !== contentLength) {
      return undefined
    }
    return { blob, ...metadata }
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

const putCachedImage = async (
  cache: Readonly<Cache> | undefined,
  key: string,
  image: Readonly<ConvertedImage>,
): Promise<void> => {
  if (!cache) {
    return
  }
  try {
    await cache.put(
      key,
      new Response(image.blob, {
        headers: {
          [ContentLengthHeader]: String(image.blob.size),
          [HeightHeader]: String(image.height),
          [OriginalHeightHeader]: String(image.originalHeight),
          [OriginalWidthHeader]: String(image.originalWidth),
          [WidthHeader]: String(image.width),
        },
      }),
    )
  } catch {
    // Caching is best-effort; the converted image can still be displayed.
  }
}

const toImageSource = (image: Readonly<ConvertedImage>, tier: ImageTier, createUrl: CreateObjectUrl): ImageSource => {
  return {
    height: image.height,
    isFullResolution: tier === 'full' || (image.width === image.originalWidth && image.height === image.originalHeight),
    originalHeight: image.originalHeight,
    originalWidth: image.originalWidth,
    owned: true,
    tier,
    url: createUrl(image.blob),
    width: image.width,
  }
}

export const convertHeicToPreviewUrlWithDependencies = async (
  uri: string,
  tier: ImageTier,
  dependencies: ConvertHeicToPreviewUrlDependencies,
): Promise<ImageSource> => {
  const { cacheStorage, convert, createUrl, getHash, getSetting, readBlob } = dependencies
  const cachingEnabled = (await getSetting(CachingEnabledSetting)) === true
  if (!cachingEnabled) {
    const heic = await readBlob(uri)
    const image = await convert(heic, tier)
    return toImageSource(image, tier, createUrl)
  }

  const hash = await getFileHashForCache(uri, getHash)
  const cache = hash ? await getCache(cacheStorage) : undefined
  const cacheKey = hash ? getCacheKey(hash, tier) : ''
  const cachedImage = cacheKey ? await getCachedImage(cache, cacheKey, tier) : undefined
  if (cachedImage) {
    return toImageSource(cachedImage, tier, createUrl)
  }

  const heic = await readBlob(uri)
  const image = await convert(heic, tier)
  if (cacheKey) {
    await putCachedImage(cache, cacheKey, image)
  }
  return toImageSource(image, tier, createUrl)
}

const convertHeicToUrl = async (uri: string, tier: ImageTier): Promise<ImageSource> => {
  return convertHeicToPreviewUrlWithDependencies(uri, tier, {
    cacheStorage: globalThis.caches,
    convert: ImageConversionWorker.convertHeicToPreview,
    createUrl: createObjectUrl,
    getHash: getFileHash,
    getSetting: getPreference,
    readBlob: readFileAsBlob,
  })
}

export const convertHeicToPreviewUrl = async (uri: string): Promise<ImageSource> => {
  return convertHeicToUrl(uri, 'preview')
}

export const convertHeicToFullResolutionUrl = async (uri: string): Promise<ImageSource> => {
  return convertHeicToUrl(uri, 'full')
}
