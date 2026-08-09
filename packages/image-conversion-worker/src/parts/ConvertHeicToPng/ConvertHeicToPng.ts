import { encode } from 'fast-png'
import decodeHeic from 'heic-decode'

interface DecodedImage {
  readonly data: Uint8ClampedArray
  readonly height: number
  readonly width: number
}

type Decode = (options: { readonly buffer: Uint8Array }) => Promise<DecodedImage>
type Encode = (image: DecodedImage) => Uint8Array

export const convertHeicToPngWithDependencies = async (heic: Blob, decode: Decode, encodePng: Encode): Promise<Blob> => {
  const buffer = new Uint8Array(await heic.arrayBuffer())
  const image = await decode({ buffer })
  const pngBytes = encodePng(image)
  const pngBuffer = new ArrayBuffer(pngBytes.byteLength)
  new Uint8Array(pngBuffer).set(pngBytes)
  return new Blob([pngBuffer], { type: 'image/png' })
}

export const convertHeicToPng = async (heic: Blob): Promise<Blob> => {
  return convertHeicToPngWithDependencies(heic, decodeHeic, encode)
}
