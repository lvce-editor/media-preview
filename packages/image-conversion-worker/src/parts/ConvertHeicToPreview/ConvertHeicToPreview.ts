import decodeHeic from 'heic-decode'
import {
  type DecodedImage,
  type EncodedImage,
  encodeImageToPreview,
  type ImageTier,
} from '../EncodeImageToPreview/EncodeImageToPreview.ts'

type Decode = (options: { readonly buffer: Uint8Array }) => Promise<DecodedImage>
type EncodePreview = (image: Readonly<DecodedImage>, tier: ImageTier) => Promise<EncodedImage>

export const convertHeicToPreviewWithDependencies = async (
  heic: Readonly<Blob>,
  tier: ImageTier,
  decode: Decode,
  encodePreview: EncodePreview,
): Promise<EncodedImage> => {
  const buffer = new Uint8Array(await heic.arrayBuffer())
  const image = await decode({ buffer })
  return encodePreview(image, tier)
}

export const convertHeicToPreview = async (heic: Readonly<Blob>, tier: ImageTier): Promise<EncodedImage> => {
  return convertHeicToPreviewWithDependencies(heic, tier, decodeHeic, encodeImageToPreview)
}
