import { expect, jest, test } from '@jest/globals'
import { encode } from 'fast-png'
import { convertHeicToPngUrlWithDependencies } from '../src/parts/ConvertHeicToPngUrl/ConvertHeicToPngUrl.ts'

const decode =
  jest.fn<
    (options: {
      readonly buffer: Uint8Array
    }) => Promise<{ readonly data: Uint8ClampedArray; readonly height: number; readonly width: number }>
  >()

test('converts a HEIC image to a PNG object URL', async () => {
  const heic = new Blob(['heic'], { type: 'image/heic' })
  decode.mockResolvedValue({
    data: new Uint8ClampedArray([0, 255, 0, 255]),
    height: 1,
    width: 1,
  })
  const createObjectUrl = jest.fn<(blob: Blob) => string>().mockReturnValue('blob:https://example.com/png-id')

  await expect(convertHeicToPngUrlWithDependencies(heic, decode, encode, createObjectUrl)).resolves.toBe(
    'blob:https://example.com/png-id',
  )
  expect(decode).toHaveBeenCalledWith({ buffer: new Uint8Array([104, 101, 105, 99]) })
  const png = createObjectUrl.mock.calls[0][0]
  expect(png).toBeInstanceOf(Blob)
  expect(png.type).toBe('image/png')
})
