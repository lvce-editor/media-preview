import type { CreateRpcOptions } from '@lvce-editor/api'
import { beforeEach, expect, jest, test } from '@jest/globals'
import * as ImageConversionWorker from '../src/parts/ImageConversionWorker/ImageConversionWorker.ts'

const invoke = jest.fn<(method: string, ...params: readonly unknown[]) => Promise<unknown>>()
const createRpc = jest.fn<(options: CreateRpcOptions) => Promise<{ readonly invoke: typeof invoke }>>()

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
  const png = new Blob(['png'], { type: 'image/png' })
  invoke.mockResolvedValue(png)

  await expect(ImageConversionWorker.convertHeicToPng(heic)).resolves.toBe(png)
  await expect(ImageConversionWorker.convertHeicToPng(heic)).resolves.toBe(png)

  expect(createRpc).toHaveBeenCalledTimes(1)
  expect(createRpc).toHaveBeenCalledWith({
    id: 'builtin.media-preview.image-conversion-worker',
  })
  expect(invoke).toHaveBeenCalledTimes(2)
  expect(invoke).toHaveBeenCalledWith('ImageConversion.convertHeicToPng', heic)
})
