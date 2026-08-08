import { encode } from 'fast-png'

interface DecodedImage {
  readonly data: Uint8ClampedArray
  readonly height: number
  readonly width: number
}

type Decode = (options: { readonly buffer: Uint8Array }) => Promise<DecodedImage>
type Encode = (image: DecodedImage) => Uint8Array
type CreateObjectUrl = (blob: Blob) => string

const decodeHeic = async (options: { readonly buffer: Uint8Array }): Promise<DecodedImage> => {
  const heicDecode = await import('heic-decode')
  return heicDecode.default(options)
}

const createObjectUrl = (blob: Blob): string => {
  return URL.createObjectURL(blob)
}

export const convertHeicToPngUrlWithDependencies = async (
  heic: Blob,
  decode: Decode,
  encodePng: Encode,
  createUrl: CreateObjectUrl,
): Promise<string> => {
  const buffer = new Uint8Array(await heic.arrayBuffer())
  const image = await decode({ buffer })
  const pngBytes = encodePng(image)
  const pngBuffer = new ArrayBuffer(pngBytes.byteLength)
  new Uint8Array(pngBuffer).set(pngBytes)
  const png = new Blob([pngBuffer], { type: 'image/png' })
  return createUrl(png)
}

export const convertHeicToPngUrl = async (heic: Blob): Promise<string> => {
  return convertHeicToPngUrlWithDependencies(heic, decodeHeic, encode, createObjectUrl)
}
