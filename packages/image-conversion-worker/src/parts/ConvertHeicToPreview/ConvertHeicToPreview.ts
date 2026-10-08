import decodeHeic from 'heic-decode'
import {
  type DecodedImage,
  type EncodedImage,
  encodeImageToPreview,
  type ImageConversionOptions,
  type ImageTier,
} from '../EncodeImageToPreview/EncodeImageToPreview.ts'

type Decode = (options: { readonly buffer: Uint8Array }) => Promise<DecodedImage>
type EncodePreview = (image: Readonly<DecodedImage>, tier: ImageTier, options: ImageConversionOptions) => Promise<EncodedImage>

export const convertHeicToPreviewWithDependencies = async (
  heic: Readonly<Blob>,
  tier: ImageTier,
  options: ImageConversionOptions,
  decode: Decode,
  encodePreview: EncodePreview,
): Promise<EncodedImage> => {
  const buffer = new Uint8Array(await heic.arrayBuffer())
  const image = await decode({ buffer })
  return encodePreview(image, tier, options)
}

export const convertHeicToPreview = async (
  heic: Readonly<Blob>,
  tier: ImageTier,
  options: ImageConversionOptions,
): Promise<EncodedImage> => {
  return convertHeicToPreviewWithDependencies(heic, tier, options, decodeHeic, encodeImageToPreview)
}
