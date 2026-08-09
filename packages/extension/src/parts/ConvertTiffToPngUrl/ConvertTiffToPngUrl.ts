// cspell:ignore utif
import { encode } from 'fast-png'

interface DecodedImage {
  readonly data: Uint8Array
  readonly height: number
  readonly width: number
}

type Decode = (buffer: ArrayBuffer) => Promise<DecodedImage>
type Encode = (image: DecodedImage) => Uint8Array
type CreateObjectUrl = (blob: Blob) => string

const decodeTiff = async (buffer: ArrayBuffer): Promise<DecodedImage> => {
  const tiffDecoder = await import('utif2')
  const [image] = tiffDecoder.decode(buffer)
  if (!image) {
    throw new Error('TIFF contains no images')
  }
  tiffDecoder.decodeImage(buffer, image)
  return {
    data: tiffDecoder.toRGBA8(image),
    height: image.height,
    width: image.width,
  }
}

const createObjectUrl = (blob: Blob): string => {
  return URL.createObjectURL(blob)
}

export const convertTiffToPngUrlWithDependencies = async (
  tiff: Blob,
  decode: Decode,
  encodePng: Encode,
  createUrl: CreateObjectUrl,
): Promise<string> => {
  const image = await decode(await tiff.arrayBuffer())
  const pngBytes = encodePng(image)
  const pngBuffer = new ArrayBuffer(pngBytes.byteLength)
  new Uint8Array(pngBuffer).set(pngBytes)
  const png = new Blob([pngBuffer], { type: 'image/png' })
  return createUrl(png)
}

export const convertTiffToPngUrl = async (tiff: Blob): Promise<string> => {
  return convertTiffToPngUrlWithDependencies(tiff, decodeTiff, encode, createObjectUrl)
}
