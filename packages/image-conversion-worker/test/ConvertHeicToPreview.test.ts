import { expect, jest, test } from '@jest/globals'
import { convertHeicToPreviewWithDependencies } from '../src/parts/ConvertHeicToPreview/ConvertHeicToPreview.ts'

const decode =
  jest.fn<
    (options: {
      readonly buffer: Uint8Array
    }) => Promise<{ readonly data: Uint8ClampedArray; readonly height: number; readonly width: number }>
  >()
const encodePreview =
  jest.fn<
    (
      image: Readonly<{ readonly data: Readonly<ArrayLike<number>>; readonly height: number; readonly width: number }>,
    ) => Promise<Blob>
  >()

test('decodes a HEIC image and encodes the decoded RGBA as a preview', async () => {
  const heic = new Blob(['heic'], { type: 'image/heic' })
  const decoded = {
    data: new Uint8ClampedArray([0, 255, 0, 255]),
    height: 1,
    width: 1,
  }
  const preview = new Blob(['preview'], { type: 'image/webp' })
  decode.mockResolvedValue(decoded)
  encodePreview.mockResolvedValue(preview)

  await expect(convertHeicToPreviewWithDependencies(heic, decode, encodePreview)).resolves.toBe(preview)

  expect(decode).toHaveBeenCalledWith({ buffer: new Uint8Array([104, 101, 105, 99]) })
  expect(encodePreview).toHaveBeenCalledWith(decoded)
})
