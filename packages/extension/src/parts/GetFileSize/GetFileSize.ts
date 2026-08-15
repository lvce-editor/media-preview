import { readAsObjectUrl, type ReadAsObjectUrlResult } from '@lvce-editor/api'

type ReadAsObjectUrl = (uri: string) => Promise<ReadAsObjectUrlResult>
type Fetch = (url: string) => Promise<Response>

export const getFileSizeWithDependencies = async (uri: string, read: ReadAsObjectUrl, fetchFn: Fetch): Promise<number> => {
  try {
    const result = await read(uri)
    if (!result.wasFound) {
      return 0
    }
    const response = await fetchFn(result.objectUrl)
    if (!response.ok) {
      return 0
    }
    const blob = await response.blob()
    return blob.size
  } catch {
    return 0
  }
}

export const getFileSize = (uri: string): Promise<number> => {
  return getFileSizeWithDependencies(uri, readAsObjectUrl, fetch)
}
