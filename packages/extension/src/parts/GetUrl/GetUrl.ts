import { readAsObjectUrl, readFileAsBlob, type ReadAsObjectUrlResult } from '@lvce-editor/api'
import { convertHeicToPngUrl } from '../ConvertHeicToPngUrl/ConvertHeicToPngUrl.ts'

type ReadAsObjectUrl = (uri: string) => Promise<ReadAsObjectUrlResult>
type ReadFileAsBlob = (uri: string) => Promise<Blob>
type ConvertHeicToPngUrl = (blob: Blob) => Promise<string>

const isHeicUri = (uri: string): boolean => {
  return uri.toLowerCase().endsWith('.heic')
}

const readHeic = async (uri: string, read: ReadAsObjectUrl, readBlob: ReadFileAsBlob, convert: ConvertHeicToPngUrl) => {
  try {
    const blob = await readBlob(uri)
    return await convert(blob)
  } catch {
    return ''
  }
}

export const getUrlWithDependencies = async (
  uri: string,
  read: ReadAsObjectUrl,
  readBlob: ReadFileAsBlob,
  convert: ConvertHeicToPngUrl,
): Promise<string> => {
  if (isHeicUri(uri)) {
    return readHeic(uri, read, readBlob, convert)
  }
  const result = await read(uri)
  return result.wasFound ? result.objectUrl : ''
}

export const getUrl = async (uri: string): Promise<string> => {
  return getUrlWithDependencies(uri, readAsObjectUrl, readFileAsBlob, convertHeicToPngUrl)
}
