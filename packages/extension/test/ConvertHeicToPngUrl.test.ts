import { expect, jest, test } from '@jest/globals'
import { convertHeicToPngUrlWithDependencies } from '../src/parts/ConvertHeicToPngUrl/ConvertHeicToPngUrl.ts'

test('creates an object URL for the converted PNG', async () => {
  const heic = new Blob(['heic'], { type: 'image/heic' })
  const png = new Blob(['png'], { type: 'image/png' })
  const convert = jest.fn<(blob: Blob) => Promise<Blob>>().mockResolvedValue(png)
  const createObjectUrl = jest.fn<(blob: Blob) => string>().mockReturnValue('blob:https://example.com/png-id')

  await expect(convertHeicToPngUrlWithDependencies(heic, convert, createObjectUrl)).resolves.toBe(
    'blob:https://example.com/png-id',
  )
  expect(convert).toHaveBeenCalledWith(heic)
  expect(createObjectUrl).toHaveBeenCalledWith(png)
})
