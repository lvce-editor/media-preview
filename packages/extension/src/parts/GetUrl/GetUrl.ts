import { readFileAsBlob } from '@lvce-editor/api'
import type { ImageSource } from '../ImageSource/ImageSource.ts'
import { convertHeicToFullResolutionUrl, convertHeicToPreviewUrl } from '../ConvertHeicToPreviewUrl/ConvertHeicToPreviewUrl.ts'
import { convertTiffToPngUrl } from '../ConvertTiffToPngUrl/ConvertTiffToPngUrl.ts'

type ReadFileAsBlob = (uri: string) => Promise<Blob>
type CreateObjectUrl = (blob: Blob) => string
type ConvertHeicToPreviewUrl = (uri: string) => Promise<ImageSource>
type ConvertTiffToPngUrl = (blob: Blob) => Promise<string>

const isHeicUri = (uri: string): boolean => {
  const normalizedUri = uri.toLowerCase()
  return normalizedUri.endsWith('.heic') || normalizedUri.endsWith('.heif')
}

const isTiffUri = (uri: string): boolean => {
  const normalizedUri = uri.toLowerCase()
  return normalizedUri.endsWith('.tif') || normalizedUri.endsWith('.tiff')
}

const createObjectUrl = (blob: Blob): string => {
  return URL.createObjectURL(blob)
}

const toSimpleSource = (url: string): ImageSource => {
  return {
    height: 0,
    isFullResolution: true,
    originalHeight: 0,
    originalWidth: 0,
    owned: Boolean(url),
    tier: 'full',
    url,
    width: 0,
  }
}

export const getUrlWithDependencies = async (
  uri: string,
  readBlob: ReadFileAsBlob,
  createUrl: CreateObjectUrl,
  convertHeic: ConvertHeicToPreviewUrl,
  convertTiff: ConvertTiffToPngUrl,
): Promise<ImageSource> => {
  if (isHeicUri(uri)) {
    try {
      return await convertHeic(uri)
    } catch {
      return toSimpleSource('')
    }
  }
  if (isTiffUri(uri)) {
    try {
      const blob = await readBlob(uri)
      return toSimpleSource(await convertTiff(blob))
    } catch {
      return toSimpleSource('')
    }
  }
  try {
    const blob = await readBlob(uri)
    return toSimpleSource(createUrl(blob))
  } catch {
    return toSimpleSource('')
  }
}

export const getUrl = async (uri: string): Promise<ImageSource> => {
  return getUrlWithDependencies(uri, readFileAsBlob, createObjectUrl, convertHeicToPreviewUrl, convertTiffToPngUrl)
}

export const getFullResolutionUrl = async (uri: string): Promise<ImageSource> => {
  if (!isHeicUri(uri)) {
    return getUrl(uri)
  }
  return convertHeicToFullResolutionUrl(uri)
}
