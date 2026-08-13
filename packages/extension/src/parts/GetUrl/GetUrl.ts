import { readAsObjectUrl, readFileAsBlob, type ReadAsObjectUrlResult } from '@lvce-editor/api'
import type { ImageSource } from '../ImageSource/ImageSource.ts'
import { convertHeicToFullResolutionUrl, convertHeicToPreviewUrl } from '../ConvertHeicToPreviewUrl/ConvertHeicToPreviewUrl.ts'
import { convertTiffToPngUrl } from '../ConvertTiffToPngUrl/ConvertTiffToPngUrl.ts'

type ReadAsObjectUrl = (uri: string) => Promise<ReadAsObjectUrlResult>
type ReadFileAsBlob = (uri: string) => Promise<Blob>
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
  read: ReadAsObjectUrl,
  readBlob: ReadFileAsBlob,
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
  const result = await read(uri)
  return toSimpleSource(result.wasFound ? result.objectUrl : '')
}

export const getUrl = async (uri: string): Promise<ImageSource> => {
  return getUrlWithDependencies(uri, readAsObjectUrl, readFileAsBlob, convertHeicToPreviewUrl, convertTiffToPngUrl)
}

export const getFullResolutionUrl = async (uri: string): Promise<ImageSource> => {
  if (!isHeicUri(uri)) {
    return getUrl(uri)
  }
  return convertHeicToFullResolutionUrl(uri)
}
