import decodeHeic from 'heic-decode'
import { type DecodedImage, encodeImageToPreview } from '../EncodeImageToPreview/EncodeImageToPreview.ts'

type Decode = (options: { readonly buffer: Uint8Array }) => Promise<DecodedImage>
type EncodePreview = (image: Readonly<DecodedImage>) => Promise<Blob>

export const convertHeicToPreviewWithDependencies = async (
  heic: Readonly<Blob>,
  decode: Decode,
  encodePreview: EncodePreview,
): Promise<Blob> => {
  const buffer = new Uint8Array(await heic.arrayBuffer())
  const image = await decode({ buffer })
  return encodePreview(image)
}

export const convertHeicToPreview = async (heic: Readonly<Blob>): Promise<Blob> => {
  return convertHeicToPreviewWithDependencies(heic, decodeHeic, encodeImageToPreview)
}
