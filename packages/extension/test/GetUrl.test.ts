import type { ReadAsObjectUrlResult } from '@lvce-editor/api'
import { beforeEach, expect, jest, test } from '@jest/globals'
import { getUrlWithDependencies } from '../src/parts/GetUrl/GetUrl.ts'

const readAsObjectUrl = jest.fn<(uri: string) => Promise<ReadAsObjectUrlResult>>()
const readFileAsBlob = jest.fn<(uri: string) => Promise<Blob>>()
const convertHeicToPngUrl = jest.fn<(blob: Blob) => Promise<string>>()
const convertTiffToPngUrl = jest.fn<(blob: Blob) => Promise<string>>()

beforeEach(() => {
  jest.resetAllMocks()
})

test('returns the object URL when the file was found', async () => {
  readAsObjectUrl.mockResolvedValue({
    error: '',
    objectUrl: 'blob:https://example.com/image-id',
    wasFound: true,
  })

  await expect(
    getUrlWithDependencies(
      'html:///workspace/image.png',
      readAsObjectUrl,
      readFileAsBlob,
      convertHeicToPngUrl,
      convertTiffToPngUrl,
    ),
  ).resolves.toBe('blob:https://example.com/image-id')
  expect(readAsObjectUrl).toHaveBeenCalledWith('html:///workspace/image.png')
  expect(readFileAsBlob).not.toHaveBeenCalled()
  expect(convertHeicToPngUrl).not.toHaveBeenCalled()
  expect(convertTiffToPngUrl).not.toHaveBeenCalled()
})

test('returns an empty URL when the file could not be read', async () => {
  readAsObjectUrl.mockResolvedValue({
    error: 'File not found',
    objectUrl: '',
    wasFound: false,
  })

  await expect(
    getUrlWithDependencies(
      'html:///workspace/missing.png',
      readAsObjectUrl,
      readFileAsBlob,
      convertHeicToPngUrl,
      convertTiffToPngUrl,
    ),
  ).resolves.toBe('')
  expect(readFileAsBlob).not.toHaveBeenCalled()
  expect(convertHeicToPngUrl).not.toHaveBeenCalled()
})

test('converts lowercase HEIC images to PNG', async () => {
  const heic = new Blob(['heic'], { type: 'image/heic' })
  readFileAsBlob.mockResolvedValue(heic)
  convertHeicToPngUrl.mockResolvedValue('blob:https://example.com/png-id')

  await expect(
    getUrlWithDependencies(
      'html:///workspace/image.heic',
      readAsObjectUrl,
      readFileAsBlob,
      convertHeicToPngUrl,
      convertTiffToPngUrl,
    ),
  ).resolves.toBe('blob:https://example.com/png-id')
  expect(readAsObjectUrl).not.toHaveBeenCalled()
  expect(readFileAsBlob).toHaveBeenCalledWith('html:///workspace/image.heic')
  expect(convertHeicToPngUrl).toHaveBeenCalledWith(heic)
})

test('converts uppercase HEIC images to PNG', async () => {
  const heic = new Blob(['heic'], { type: 'image/heic' })
  readFileAsBlob.mockResolvedValue(heic)
  convertHeicToPngUrl.mockResolvedValue('blob:https://example.com/png-id')

  await expect(
    getUrlWithDependencies(
      'html:///workspace/image.HEIC',
      readAsObjectUrl,
      readFileAsBlob,
      convertHeicToPngUrl,
      convertTiffToPngUrl,
    ),
  ).resolves.toBe('blob:https://example.com/png-id')
  expect(readAsObjectUrl).not.toHaveBeenCalled()
  expect(readFileAsBlob).toHaveBeenCalledWith('html:///workspace/image.HEIC')
  expect(convertHeicToPngUrl).toHaveBeenCalledWith(heic)
})

test('returns an empty URL when a HEIC image cannot be read', async () => {
  readFileAsBlob.mockRejectedValue(new Error('File not found'))

  await expect(
    getUrlWithDependencies(
      'html:///workspace/missing.heic',
      readAsObjectUrl,
      readFileAsBlob,
      convertHeicToPngUrl,
      convertTiffToPngUrl,
    ),
  ).resolves.toBe('')
  expect(convertHeicToPngUrl).not.toHaveBeenCalled()
})

test('converts HEIF images to PNG', async () => {
  const heif = new Blob(['heif'], { type: 'image/heif' })
  readFileAsBlob.mockResolvedValue(heif)
  convertHeicToPngUrl.mockResolvedValue('blob:https://example.com/png-id')

  await expect(
    getUrlWithDependencies(
      'html:///workspace/image.HEIF',
      readAsObjectUrl,
      readFileAsBlob,
      convertHeicToPngUrl,
      convertTiffToPngUrl,
    ),
  ).resolves.toBe('blob:https://example.com/png-id')
  expect(readAsObjectUrl).not.toHaveBeenCalled()
  expect(readFileAsBlob).toHaveBeenCalledWith('html:///workspace/image.HEIF')
  expect(convertHeicToPngUrl).toHaveBeenCalledWith(heif)
})

test.each(['image.tif', 'image.TIFF'])('converts TIFF images to PNG: %s', async (fileName) => {
  const tiff = new Blob(['tiff'], { type: 'image/tiff' })
  readFileAsBlob.mockResolvedValue(tiff)
  convertTiffToPngUrl.mockResolvedValue('blob:https://example.com/png-id')
  const uri = `html:///workspace/${fileName}`

  await expect(
    getUrlWithDependencies(uri, readAsObjectUrl, readFileAsBlob, convertHeicToPngUrl, convertTiffToPngUrl),
  ).resolves.toBe('blob:https://example.com/png-id')
  expect(readAsObjectUrl).not.toHaveBeenCalled()
  expect(readFileAsBlob).toHaveBeenCalledWith(uri)
  expect(convertTiffToPngUrl).toHaveBeenCalledWith(tiff)
})

test('returns an empty URL when a TIFF image cannot be converted', async () => {
  readFileAsBlob.mockResolvedValue(new Blob(['invalid']))
  convertTiffToPngUrl.mockRejectedValue(new Error('Invalid TIFF'))

  await expect(
    getUrlWithDependencies(
      'html:///workspace/invalid.tiff',
      readAsObjectUrl,
      readFileAsBlob,
      convertHeicToPngUrl,
      convertTiffToPngUrl,
    ),
  ).resolves.toBe('')
})
