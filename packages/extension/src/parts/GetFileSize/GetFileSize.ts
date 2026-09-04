import { readFileAsBlob } from '@lvce-editor/api'
import { toFileUri } from '../ToFileUri/ToFileUri.ts'

type ReadFileAsBlob = (uri: string) => Promise<Blob>

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
