// cspell:ignore utif
import { encode } from 'fast-png'
import * as tiffDecoder from 'utif2'

interface DecodedImage {
  readonly data: Uint8Array
  readonly height: number
  readonly width: number
}

type Decode = (buffer: ArrayBuffer) => DecodedImage
type Encode = (image: DecodedImage) => Uint8Array

const decodeTiff = (buffer: ArrayBuffer): DecodedImage => {
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

export const convertTiffToPngWithDependencies = async (tiff: Blob, decode: Decode, encodePng: Encode): Promise<Blob> => {
  const image = decode(await tiff.arrayBuffer())
  const pngBytes = encodePng(image)
  const pngBuffer = new ArrayBuffer(pngBytes.byteLength)
  new Uint8Array(pngBuffer).set(pngBytes)
  return new Blob([pngBuffer], { type: 'image/png' })
}

export const convertTiffToPng = async (tiff: Blob): Promise<Blob> => {
  return convertTiffToPngWithDependencies(tiff, decodeTiff, encode)
}
