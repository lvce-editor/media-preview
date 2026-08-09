import { expect, jest, test } from '@jest/globals'
import { convertTiffToPngUrlWithDependencies } from '../src/parts/ConvertTiffToPngUrl/ConvertTiffToPngUrl.ts'

test('creates an object URL for the converted PNG', async () => {
  const tiff = new Blob(['tiff'], { type: 'image/tiff' })
  const png = new Blob(['png'], { type: 'image/png' })
  const convert = jest.fn<(blob: Blob) => Promise<Blob>>().mockResolvedValue(png)
  const createObjectUrl = jest.fn<(blob: Blob) => string>().mockReturnValue('blob:https://example.com/png-id')

  await expect(convertTiffToPngUrlWithDependencies(tiff, convert, createObjectUrl)).resolves.toBe(
    'blob:https://example.com/png-id',
  )
  expect(convert).toHaveBeenCalledWith(tiff)
  expect(createObjectUrl).toHaveBeenCalledWith(png)
})
