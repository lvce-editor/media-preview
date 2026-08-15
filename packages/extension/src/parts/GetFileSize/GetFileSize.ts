import { readFileAsBlob } from '@lvce-editor/api'

type ReadFileAsBlob = (uri: string) => Promise<Blob>

const toFileUri = (uri: string): string => {
  if (uri.startsWith('/')) {
    return `file://${uri}`
  }
  if (/^[a-zA-Z]:[\\/]/.test(uri)) {
    return `file:///${uri.replaceAll('\\', '/')}`
  }
  return uri
}

export const getFileSizeWithDependency = async (uri: string, readBlob: ReadFileAsBlob): Promise<number> => {
  try {
    const blob = await readBlob(toFileUri(uri))
    return blob.size
  } catch {
    return 0
  }
}

export const getFileSize = (uri: string): Promise<number> => {
  return getFileSizeWithDependency(uri, readFileAsBlob)
}
