import { expect, jest, test } from '@jest/globals'
import { encode } from 'fast-png'
import { convertHeicToPngWithDependencies } from '../src/parts/ConvertHeicToPng/ConvertHeicToPng.ts'

const decode =
  jest.fn<
    (options: {
      readonly buffer: Uint8Array
    }) => Promise<{ readonly data: Uint8ClampedArray; readonly height: number; readonly width: number }>
  >()

test('converts a HEIC image to a PNG blob', async () => {
  const heic = new Blob(['heic'], { type: 'image/heic' })
  decode.mockResolvedValue({
    data: new Uint8ClampedArray([0, 255, 0, 255]),
    height: 1,
    width: 1,
  })

  const png = await convertHeicToPngWithDependencies(heic, decode, encode)

  expect(decode).toHaveBeenCalledWith({ buffer: new Uint8Array([104, 101, 105, 99]) })
  expect(png).toBeInstanceOf(Blob)
  expect(png.type).toBe('image/png')
})
