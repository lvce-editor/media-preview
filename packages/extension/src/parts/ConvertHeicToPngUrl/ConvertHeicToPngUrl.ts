import { getFileHash, getPreference, readFileAsBlob } from '@lvce-editor/api'
import * as ImageConversionWorker from '../ImageConversionWorker/ImageConversionWorker.ts'

type ConvertHeicToPng = (heic: Blob) => Promise<Blob>
type CreateObjectUrl = (blob: Blob) => string
type GetFileHash = (uri: string) => Promise<string>
type GetPreference = (key: string) => Promise<unknown>
type ReadFileAsBlob = (uri: string) => Promise<Blob>

interface ConvertHeicToPngUrlDependencies {
  readonly cacheStorage: Readonly<CacheStorage> | undefined
  readonly convert: ConvertHeicToPng
  readonly createUrl: CreateObjectUrl
  readonly getHash: GetFileHash
  readonly getSetting: GetPreference
  readonly readBlob: ReadFileAsBlob
}

const CacheName = 'builtin.media-preview.heic-png-v1'
const CacheKeyPrefix = 'https://media-preview-cache.invalid/heic-png/'
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
  return `${CacheKeyPrefix}${encodeURIComponent(hash)}.png`
}

const getCachedPng = async (cache: Readonly<Cache> | undefined, key: string): Promise<Blob | undefined> => {
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

const putCachedPng = async (cache: Readonly<Cache> | undefined, key: string, png: Blob): Promise<void> => {
  if (!cache) {
    return
  }
  try {
    await cache.put(key, new Response(png))
  } catch {
    // Caching is best-effort; the converted image can still be displayed.
  }
}

export const convertHeicToPngUrlWithDependencies = async (
  uri: string,
  dependencies: ConvertHeicToPngUrlDependencies,
): Promise<string> => {
  const { cacheStorage, convert, createUrl, getHash, getSetting, readBlob } = dependencies
  const cachingEnabled = (await getSetting(CachingEnabledSetting)) === true
  if (!cachingEnabled) {
    const heic = await readBlob(uri)
    const png = await convert(heic)
    return createUrl(png)
  }

  const hash = await getFileHashForCache(uri, getHash)
  const cache = hash ? await getCache(cacheStorage) : undefined
  const cacheKey = hash ? getCacheKey(hash) : ''
  const cachedPng = cacheKey ? await getCachedPng(cache, cacheKey) : undefined
  if (cachedPng) {
    return createUrl(cachedPng)
  }

  const heic = await readBlob(uri)
  const png = await convert(heic)
  if (cacheKey) {
    await putCachedPng(cache, cacheKey, png)
  }
  return createUrl(png)
}

export const convertHeicToPngUrl = async (uri: string): Promise<string> => {
  return convertHeicToPngUrlWithDependencies(uri, {
    cacheStorage: globalThis.caches,
    convert: ImageConversionWorker.convertHeicToPng,
    createUrl: createObjectUrl,
    getHash: getFileHash,
    getSetting: getPreference,
    readBlob: readFileAsBlob,
  })
}
