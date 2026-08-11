import { readAsObjectUrl, readFileAsBlob, type ReadAsObjectUrlResult } from '@lvce-editor/api'
import { convertHeicToPngUrl } from '../ConvertHeicToPngUrl/ConvertHeicToPngUrl.ts'
import { convertTiffToPngUrl } from '../ConvertTiffToPngUrl/ConvertTiffToPngUrl.ts'

type ReadAsObjectUrl = (uri: string) => Promise<ReadAsObjectUrlResult>
type ReadFileAsBlob = (uri: string) => Promise<Blob>
type ConvertHeicToPngUrl = (uri: string) => Promise<string>
type ConvertTiffToPngUrl = (blob: Blob) => Promise<string>

const isHeicUri = (uri: string): boolean => {
  const normalizedUri = uri.toLowerCase()
  return normalizedUri.endsWith('.heic') || normalizedUri.endsWith('.heif')
}

const isTiffUri = (uri: string): boolean => {
  const normalizedUri = uri.toLowerCase()
  return normalizedUri.endsWith('.tif') || normalizedUri.endsWith('.tiff')
}

export const getUrlWithDependencies = async (
  uri: string,
  read: ReadAsObjectUrl,
  readBlob: ReadFileAsBlob,
  convertHeic: ConvertHeicToPngUrl,
  convertTiff: ConvertTiffToPngUrl,
): Promise<string> => {
  if (isHeicUri(uri)) {
    try {
      return await convertHeic(uri)
    } catch {
      return ''
    }
  }
  if (isTiffUri(uri)) {
    try {
      const blob = await readBlob(uri)
      return await convertTiff(blob)
    } catch {
      return ''
    }
  }
  const result = await read(uri)
  return result.wasFound ? result.objectUrl : ''
}

export const getUrl = async (uri: string): Promise<string> => {
  return getUrlWithDependencies(uri, readAsObjectUrl, readFileAsBlob, convertHeicToPngUrl, convertTiffToPngUrl)
}
