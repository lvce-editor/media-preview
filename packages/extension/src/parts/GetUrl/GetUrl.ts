import * as GetRemoteUrl from '../GetRemoteUrl/GetRemoteUrl.ts'

export const getUrl = (uri: string): string => {
  // TODO if platform is web, use data url or blob url
  // TODO if platform is remote or electron, use remote url
  const url = GetRemoteUrl.getRemoteUrl(uri)
  return url
}
