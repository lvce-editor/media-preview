import { expect, jest, test } from '@jest/globals'
import { encode } from 'fast-png'
import { convertTiffToPngWithDependencies } from '../src/parts/ConvertTiffToPng/ConvertTiffToPng.ts'

test('converts a TIFF image to a PNG blob', async () => {
  const decode = jest.fn<
    (buffer: Readonly<ArrayBuffer>) => { readonly data: Uint8Array; readonly height: number; readonly width: number }
  >(() => ({
    data: new Uint8Array([255, 0, 0, 255]),
    height: 1,
    width: 1,
  }))
  const tiff = new Blob(['tiff'], { type: 'image/tiff' })

  const png = await convertTiffToPngWithDependencies(tiff, decode, encode)

  expect(decode).toHaveBeenCalledWith(new Uint8Array([116, 105, 102, 102]).buffer)
  expect(png).toBeInstanceOf(Blob)
  expect(png.type).toBe('image/png')
})
