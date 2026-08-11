import { beforeEach, expect, jest, test } from '@jest/globals'
import { encodeImageToPreviewWithDependencies } from '../src/parts/EncodeImageToPreview/EncodeImageToPreview.ts'

const image = {
  data: new Uint8ClampedArray([12, 34, 56, 78]),
  height: 1,
  width: 1,
}
const imageData = { data: image.data, height: 1, width: 1 } as ImageData
const putImageData = jest.fn()
const getContext = jest.fn().mockReturnValue({ putImageData })
const convertToBlob = jest.fn<(options?: Readonly<ImageEncodeOptions>) => Promise<Blob>>()
const canvas = { convertToBlob, getContext } as unknown as OffscreenCanvas
const createCanvas = jest.fn<(width: number, height: number) => OffscreenCanvas>().mockReturnValue(canvas)
const createImageData = jest
  .fn<(data: Readonly<ArrayLike<number>>, width: number, height: number) => ImageData>()
  .mockReturnValue(imageData)

beforeEach(() => {
  jest.clearAllMocks()
  getContext.mockReturnValue({ putImageData })
})

test('draws the decoded RGBA pixels and encodes a full-size WebP preview', async () => {
  const webp = new Blob(['webp'], { type: 'image/webp' })
  convertToBlob.mockResolvedValue(webp)

  await expect(encodeImageToPreviewWithDependencies(image, createCanvas, createImageData)).resolves.toBe(webp)

  expect(createCanvas).toHaveBeenCalledWith(1, 1)
  expect(getContext).toHaveBeenCalledWith('2d')
  expect(createImageData).toHaveBeenCalledWith(image.data, 1, 1)
  expect(putImageData).toHaveBeenCalledWith(imageData, 0, 0)
  expect(convertToBlob).toHaveBeenCalledWith({ quality: 0.9, type: 'image/webp' })
})

test('accepts a browser-native PNG fallback', async () => {
  const png = new Blob(['png'], { type: 'image/png' })
  convertToBlob.mockResolvedValue(png)

  await expect(encodeImageToPreviewWithDependencies(image, createCanvas, createImageData)).resolves.toBe(png)

  expect(convertToBlob).toHaveBeenCalledTimes(1)
})

test('explicitly encodes PNG when WebP encoding fails', async () => {
  const png = new Blob(['png'], { type: 'image/png' })
  convertToBlob.mockRejectedValueOnce(new Error('WebP is unavailable')).mockResolvedValueOnce(png)

  await expect(encodeImageToPreviewWithDependencies(image, createCanvas, createImageData)).resolves.toBe(png)

  expect(convertToBlob).toHaveBeenNthCalledWith(1, { quality: 0.9, type: 'image/webp' })
  expect(convertToBlob).toHaveBeenNthCalledWith(2, { type: 'image/png' })
})

test('explicitly encodes PNG when WebP returns an unsupported format', async () => {
  const jpeg = new Blob(['jpeg'], { type: 'image/jpeg' })
  const png = new Blob(['png'], { type: 'image/png' })
  convertToBlob.mockResolvedValueOnce(jpeg).mockResolvedValueOnce(png)

  await expect(encodeImageToPreviewWithDependencies(image, createCanvas, createImageData)).resolves.toBe(png)

  expect(convertToBlob).toHaveBeenNthCalledWith(2, { type: 'image/png' })
})

test('throws when a 2D canvas context is unavailable', async () => {
  getContext.mockReturnValue(undefined)

  await expect(encodeImageToPreviewWithDependencies(image, createCanvas, createImageData)).rejects.toThrow(
    'Failed to create 2D canvas context',
  )

  expect(createImageData).not.toHaveBeenCalled()
  expect(convertToBlob).not.toHaveBeenCalled()
})
