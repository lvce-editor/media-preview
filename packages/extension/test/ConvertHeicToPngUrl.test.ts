import { beforeEach, expect, jest, test } from '@jest/globals'
import { convertHeicToPngUrlWithDependencies } from '../src/parts/ConvertHeicToPngUrl/ConvertHeicToPngUrl.ts'

const uri = 'file:///workspace/image.heic'
const hash = 'sha256-image-hash'
const cacheKey = `https://media-preview-cache.invalid/heic-png/${hash}.png`
const heic = new Blob(['heic'], { type: 'image/heic' })
const png = new Blob(['png'], { type: 'image/png' })
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
} => {
  const values = new Map<string, Response>(Object.entries(initialValues))
  const putKeys: string[] = []
  const cache = {
    async match(key: string): Promise<Response | undefined> {
      return values.get(key)?.clone()
    },
    async put(key: string, response: Response): Promise<void> {
      putKeys.push(key)
      values.set(key, response.clone())
    },
  } as unknown as Cache
  const cacheStorage = {
    async open(name: string): Promise<Cache> {
      expect(name).toBe('builtin.media-preview.heic-png-v1')
      return cache
    },
  } as unknown as CacheStorage
  return { cacheStorage, putKeys }
}

beforeEach(() => {
  jest.resetAllMocks()
  convert.mockResolvedValue(png)
  createObjectUrl.mockReturnValue('blob:https://example.com/png-id')
  getHash.mockResolvedValue(hash)
  readFileAsBlob.mockResolvedValue(heic)
})

test('converts without querying the hash or cache when caching is disabled', async () => {
  getSetting.mockResolvedValue(false)
  const { cacheStorage, putKeys } = createMemoryCacheStorage()

  await expect(
    convertHeicToPngUrlWithDependencies(uri, {
      cacheStorage,
      convert,
      createUrl: createObjectUrl,
      getHash,
      getSetting,
      readBlob: readFileAsBlob,
    }),
  ).resolves.toBe('blob:https://example.com/png-id')

  expect(getSetting).toHaveBeenCalledWith('mediaPreview.cachingEnabled')
  expect(getHash).not.toHaveBeenCalled()
  expect(putKeys).toEqual([])
  expect(readFileAsBlob).toHaveBeenCalledWith(uri)
  expect(convert).toHaveBeenCalledWith(heic)
  expect(createObjectUrl).toHaveBeenCalledWith(png)
})

test('uses the cached PNG before reading the HEIC blob when caching is enabled', async () => {
  getSetting.mockResolvedValue(true)
  const cachedPng = new Blob(['cached png'], { type: 'image/png' })
  const { cacheStorage, putKeys } = createMemoryCacheStorage({
    [cacheKey]: new Response(cachedPng),
  })

  await expect(
    convertHeicToPngUrlWithDependencies(uri, {
      cacheStorage,
      convert,
      createUrl: createObjectUrl,
      getHash,
      getSetting,
      readBlob: readFileAsBlob,
    }),
  ).resolves.toBe('blob:https://example.com/png-id')

  expect(getHash).toHaveBeenCalledWith(uri)
  expect(readFileAsBlob).not.toHaveBeenCalled()
  expect(convert).not.toHaveBeenCalled()
  expect(putKeys).toEqual([])
  expect(createObjectUrl).toHaveBeenCalledTimes(1)
  expect(await createObjectUrl.mock.calls[0][0].text()).toBe('cached png')
})

test('converts and caches the PNG after a cache miss', async () => {
  getSetting.mockResolvedValue(true)
  const { cacheStorage, putKeys } = createMemoryCacheStorage()

  await expect(
    convertHeicToPngUrlWithDependencies(uri, {
      cacheStorage,
      convert,
      createUrl: createObjectUrl,
      getHash,
      getSetting,
      readBlob: readFileAsBlob,
    }),
  ).resolves.toBe('blob:https://example.com/png-id')

  expect(getHash).toHaveBeenCalledWith(uri)
  expect(readFileAsBlob).toHaveBeenCalledWith(uri)
  expect(getHash.mock.invocationCallOrder[0]).toBeLessThan(readFileAsBlob.mock.invocationCallOrder[0])
  expect(convert).toHaveBeenCalledWith(heic)
  expect(putKeys).toEqual([cacheKey])
  expect(createObjectUrl).toHaveBeenCalledWith(png)
})

test('falls back to conversion when Cache Storage is unavailable', async () => {
  getSetting.mockResolvedValue(true)

  await expect(
    convertHeicToPngUrlWithDependencies(uri, {
      cacheStorage: undefined,
      convert,
      createUrl: createObjectUrl,
      getHash,
      getSetting,
      readBlob: readFileAsBlob,
    }),
  ).resolves.toBe('blob:https://example.com/png-id')

  expect(getHash).toHaveBeenCalledWith(uri)
  expect(readFileAsBlob).toHaveBeenCalledWith(uri)
  expect(convert).toHaveBeenCalledWith(heic)
})
