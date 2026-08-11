import { getFileHash, getPreference, readFileAsBlob } from '@lvce-editor/api'
import * as ImageConversionWorker from '../ImageConversionWorker/ImageConversionWorker.ts'

type ConvertHeicToPreview = (heic: Blob) => Promise<Blob>
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

const CacheName = 'builtin.media-preview.heic-preview-v1'
const CacheKeyPrefix = 'https://media-preview-cache.invalid/heic-preview/'
const CachingEnabledSetting = 'mediaPreview.cachingEnabled'

const createObjectUrl = (blob: Blob): string => {
  return URL.createObjectURL(blob)
}

const getCache = async (cacheStorage: Readonly<CacheStorage> | undefined): Promise<Cache | undefined> => {
  if (!cacheStorage) {
    return undefined
  }
  try {
    return await cacheStorage.open(CacheName)
  } catch {
    return undefined
  }
}

const getCacheKey = (hash: string): string => {
  return `${CacheKeyPrefix}${encodeURIComponent(hash)}.webp`
}

const getCachedPreview = async (cache: Readonly<Cache> | undefined, key: string): Promise<Blob | undefined> => {
  if (!cache) {
    return undefined
  }
  try {
    const response = await cache.match(key)
    return response?.blob()
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

const putCachedPreview = async (cache: Readonly<Cache> | undefined, key: string, preview: Blob): Promise<void> => {
  if (!cache) {
    return
  }
  try {
    await cache.put(key, new Response(preview))
  } catch {
    // Caching is best-effort; the converted image can still be displayed.
  }
}

export const convertHeicToPreviewUrlWithDependencies = async (
  uri: string,
  dependencies: ConvertHeicToPreviewUrlDependencies,
): Promise<string> => {
  const { cacheStorage, convert, createUrl, getHash, getSetting, readBlob } = dependencies
  const cachingEnabled = (await getSetting(CachingEnabledSetting)) === true
  if (!cachingEnabled) {
    const heic = await readBlob(uri)
    const preview = await convert(heic)
    return createUrl(preview)
  }

  const hash = await getFileHashForCache(uri, getHash)
  const cache = hash ? await getCache(cacheStorage) : undefined
  const cacheKey = hash ? getCacheKey(hash) : ''
  const cachedPreview = cacheKey ? await getCachedPreview(cache, cacheKey) : undefined
  if (cachedPreview) {
    return createUrl(cachedPreview)
  }

  const heic = await readBlob(uri)
  const preview = await convert(heic)
  if (cacheKey) {
    await putCachedPreview(cache, cacheKey, preview)
  }
  return createUrl(preview)
}

export const convertHeicToPreviewUrl = async (uri: string): Promise<string> => {
  return convertHeicToPreviewUrlWithDependencies(uri, {
    cacheStorage: globalThis.caches,
    convert: ImageConversionWorker.convertHeicToPreview,
    createUrl: createObjectUrl,
    getHash: getFileHash,
    getSetting: getPreference,
    readBlob: readFileAsBlob,
  })
}
