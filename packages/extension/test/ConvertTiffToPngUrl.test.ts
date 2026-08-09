import { expect, jest, test } from '@jest/globals'
import { encode } from 'fast-png'
import { convertTiffToPngUrlWithDependencies } from '../src/parts/ConvertTiffToPngUrl/ConvertTiffToPngUrl.ts'

test('converts a TIFF blob to a PNG object URL', async () => {
  const decode = jest.fn<(buffer: ArrayBuffer) => Promise<{ data: Uint8Array; height: number; width: number }>>(async () => ({
    data: new Uint8Array([255, 0, 0, 255]),
    height: 1,
    width: 1,
  }))
  const tiff = new Blob(['tiff'], { type: 'image/tiff' })
  const createObjectUrl = jest.fn<(blob: Blob) => string>().mockReturnValue('blob:https://example.com/png-id')

  await expect(convertTiffToPngUrlWithDependencies(tiff, decode, encode, createObjectUrl)).resolves.toBe(
    'blob:https://example.com/png-id',
  )
  expect(decode).toHaveBeenCalledWith(new Uint8Array([116, 105, 102, 102]).buffer)
  const png = createObjectUrl.mock.calls[0][0]
  expect(png).toBeInstanceOf(Blob)
  expect(png.type).toBe('image/png')
})
