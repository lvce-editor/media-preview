import { beforeEach, expect, jest, test } from '@jest/globals'
import * as ImageConversionWorker from '../src/parts/ImageConversionWorker/ImageConversionWorker.ts'

const invoke = jest.fn<(method: string, ...params: readonly unknown[]) => Promise<unknown>>()
const createRpc = jest.fn<(options: { readonly id: string }) => Promise<{ readonly invoke: typeof invoke }>>()

beforeEach(() => {
  jest.resetAllMocks()
  createRpc.mockResolvedValue({ invoke })
  ImageConversionWorker.state.createRpc = createRpc
  ImageConversionWorker.state.rpcPromise = undefined
})

test('does not create the worker before conversion is requested', () => {
  expect(createRpc).not.toHaveBeenCalled()
})

test('lazily creates and reuses the image conversion worker', async () => {
  const heic = new Blob(['heic'], { type: 'image/heic' })
  const tiff = new Blob(['tiff'], { type: 'image/tiff' })
  const png = new Blob(['png'], { type: 'image/png' })
  const converted = {
    blob: png,
    height: 1536,
    originalHeight: 3072,
    originalWidth: 4096,
    width: 2048,
  }
  invoke.mockResolvedValueOnce(converted).mockResolvedValueOnce(converted).mockResolvedValueOnce(png)

  await expect(ImageConversionWorker.convertHeicToPreview(heic, 'preview')).resolves.toBe(converted)
  await expect(ImageConversionWorker.convertHeicToPreview(heic, 'full')).resolves.toBe(converted)
  await expect(ImageConversionWorker.convertTiffToPng(tiff)).resolves.toBe(png)

  expect(createRpc).toHaveBeenCalledTimes(1)
  expect(createRpc).toHaveBeenCalledWith({
    id: 'builtin.media-preview.image-conversion-worker',
  })
  expect(invoke).toHaveBeenCalledTimes(3)
  expect(invoke).toHaveBeenCalledWith('ImageConversion.convertHeicToPreview', heic, 'preview')
  expect(invoke).toHaveBeenCalledWith('ImageConversion.convertHeicToPreview', heic, 'full')
  expect(invoke).toHaveBeenCalledWith('ImageConversion.convertTiffToPng', tiff)
})
