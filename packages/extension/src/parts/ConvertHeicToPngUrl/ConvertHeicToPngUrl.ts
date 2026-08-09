import * as ImageConversionWorker from '../ImageConversionWorker/ImageConversionWorker.ts'

type ConvertHeicToPng = (heic: Blob) => Promise<Blob>
type CreateObjectUrl = (blob: Blob) => string

const createObjectUrl = (blob: Blob): string => {
  return URL.createObjectURL(blob)
}

export const convertHeicToPngUrlWithDependencies = async (
  heic: Blob,
  convert: ConvertHeicToPng,
  createUrl: CreateObjectUrl,
): Promise<string> => {
  const png = await convert(heic)
  return createUrl(png)
}

export const convertHeicToPngUrl = async (heic: Blob): Promise<string> => {
  return convertHeicToPngUrlWithDependencies(heic, ImageConversionWorker.convertHeicToPng, createObjectUrl)
}
