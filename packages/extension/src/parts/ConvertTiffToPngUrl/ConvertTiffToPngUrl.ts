import * as ImageConversionWorker from '../ImageConversionWorker/ImageConversionWorker.ts'

type ConvertTiffToPng = (tiff: Blob) => Promise<Blob>
type CreateObjectUrl = (blob: Blob) => string

const createObjectUrl = (blob: Blob): string => {
  return URL.createObjectURL(blob)
}

export const convertTiffToPngUrlWithDependencies = async (
  tiff: Blob,
  convert: ConvertTiffToPng,
  createUrl: CreateObjectUrl,
): Promise<string> => {
  const png = await convert(tiff)
  return createUrl(png)
}

export const convertTiffToPngUrl = async (tiff: Blob): Promise<string> => {
  return convertTiffToPngUrlWithDependencies(tiff, ImageConversionWorker.convertTiffToPng, createObjectUrl)
}
