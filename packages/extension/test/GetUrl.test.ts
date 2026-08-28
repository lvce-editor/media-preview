import type { ReadAsObjectUrlResult } from '@lvce-editor/api'
import { beforeEach, expect, jest, test } from '@jest/globals'
import type { ImageSource } from '../src/parts/ImageSource/ImageSource.ts'
import { getUrlWithDependencies } from '../src/parts/GetUrl/GetUrl.ts'

const readAsObjectUrl = jest.fn<(uri: string) => Promise<ReadAsObjectUrlResult>>()
const readFileAsBlob = jest.fn<(uri: string) => Promise<Blob>>()
const createObjectUrl = jest.fn<(blob: Blob) => string>()
const previewSource: ImageSource = {
  height: 1536,
  isFullResolution: false,
  originalHeight: 3072,
  originalWidth: 4096,
  owned: true,
  tier: 'preview',
  url: 'blob:https://example.com/preview-id',
  width: 2048,
}
const convertHeicToPreviewUrl = jest.fn<(uri: string) => Promise<ImageSource>>()
const convertTiffToPngUrl = jest.fn<(blob: Blob) => Promise<string>>()

const simpleSource = (url: string): ImageSource => ({
  height: 0,
  isFullResolution: true,
  originalHeight: 0,
  originalWidth: 0,
  owned: Boolean(url),
  tier: 'full',
  url,
  width: 0,
})

beforeEach(() => {
  jest.resetAllMocks()
})

test('reads a remote image as a blob through its file system provider', async () => {
  const blob = new Blob(['image'], { type: 'image/png' })
  readFileAsBlob.mockResolvedValue(blob)
  createObjectUrl.mockReturnValue('blob:https://example.com/image-id')

  await expect(
    getUrlWithDependencies(
      'remote-ssh:///workspace/image.png',
      readAsObjectUrl,
      readFileAsBlob,
      createObjectUrl,
      convertHeicToPreviewUrl,
      convertTiffToPngUrl,
    ),
  ).resolves.toEqual(simpleSource('blob:https://example.com/image-id'))
  expect(readFileAsBlob).toHaveBeenCalledWith('remote-ssh:///workspace/image.png')
  expect(readAsObjectUrl).not.toHaveBeenCalled()
  expect(createObjectUrl).toHaveBeenCalledWith(blob)
  expect(convertHeicToPreviewUrl).not.toHaveBeenCalled()
  expect(convertTiffToPngUrl).not.toHaveBeenCalled()
})

test('returns an empty source when a remote file could not be read', async () => {
  readFileAsBlob.mockRejectedValue(new Error('File not found'))

  await expect(
    getUrlWithDependencies(
      'remote-ssh:///workspace/missing.png',
      readAsObjectUrl,
      readFileAsBlob,
      createObjectUrl,
      convertHeicToPreviewUrl,
      convertTiffToPngUrl,
    ),
  ).resolves.toEqual(simpleSource(''))
  expect(createObjectUrl).not.toHaveBeenCalled()
  expect(convertHeicToPreviewUrl).not.toHaveBeenCalled()
})

test('keeps the existing object URL path for non-remote images', async () => {
  readAsObjectUrl.mockResolvedValue({
    error: '',
    objectUrl: 'https://example.com/image.png',
    wasFound: true,
  })

  await expect(
    getUrlWithDependencies(
      'html:///workspace/image.png',
      readAsObjectUrl,
      readFileAsBlob,
      createObjectUrl,
      convertHeicToPreviewUrl,
      convertTiffToPngUrl,
    ),
  ).resolves.toEqual(simpleSource('https://example.com/image.png'))
  expect(readAsObjectUrl).toHaveBeenCalledWith('html:///workspace/image.png')
  expect(readFileAsBlob).not.toHaveBeenCalled()
  expect(createObjectUrl).not.toHaveBeenCalled()
})

test.each(['image.heic', 'image.HEIC', 'image.HEIF'])(
  'converts HEIC/HEIF images to metadata-rich previews: %s',
  async (fileName) => {
    convertHeicToPreviewUrl.mockResolvedValue(previewSource)
    const uri = `html:///workspace/${fileName}`

    await expect(
      getUrlWithDependencies(uri, readAsObjectUrl, readFileAsBlob, createObjectUrl, convertHeicToPreviewUrl, convertTiffToPngUrl),
    ).resolves.toBe(previewSource)
    expect(readFileAsBlob).not.toHaveBeenCalled()
    expect(createObjectUrl).not.toHaveBeenCalled()
    expect(convertHeicToPreviewUrl).toHaveBeenCalledWith(uri)
  },
)

test('returns an empty source when a HEIC image cannot be read', async () => {
  convertHeicToPreviewUrl.mockRejectedValue(new Error('File not found'))

  await expect(
    getUrlWithDependencies(
      'html:///workspace/missing.heic',
      readAsObjectUrl,
      readFileAsBlob,
      createObjectUrl,
      convertHeicToPreviewUrl,
      convertTiffToPngUrl,
    ),
  ).resolves.toEqual(simpleSource(''))
})

test.each(['image.tif', 'image.TIFF'])('converts TIFF images to an owned PNG source: %s', async (fileName) => {
  const tiff = new Blob(['tiff'], { type: 'image/tiff' })
  readFileAsBlob.mockResolvedValue(tiff)
  convertTiffToPngUrl.mockResolvedValue('blob:https://example.com/png-id')
  const uri = `html:///workspace/${fileName}`

  await expect(
    getUrlWithDependencies(uri, readAsObjectUrl, readFileAsBlob, createObjectUrl, convertHeicToPreviewUrl, convertTiffToPngUrl),
  ).resolves.toEqual(simpleSource('blob:https://example.com/png-id'))
  expect(readFileAsBlob).toHaveBeenCalledWith(uri)
  expect(createObjectUrl).not.toHaveBeenCalled()
  expect(convertTiffToPngUrl).toHaveBeenCalledWith(tiff)
})

test('returns an empty source when a TIFF image cannot be converted', async () => {
  readFileAsBlob.mockResolvedValue(new Blob(['invalid']))
  convertTiffToPngUrl.mockRejectedValue(new Error('Invalid TIFF'))

  await expect(
    getUrlWithDependencies(
      'html:///workspace/invalid.tiff',
      readAsObjectUrl,
      readFileAsBlob,
      createObjectUrl,
      convertHeicToPreviewUrl,
      convertTiffToPngUrl,
    ),
  ).resolves.toEqual(simpleSource(''))
})
