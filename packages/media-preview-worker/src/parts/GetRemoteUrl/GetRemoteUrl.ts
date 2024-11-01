export const getRemoteUrl = (uri: string): string => {
  // TODO maybe instead of hardcoding path,
  // ask extension api to generate a remote url for a file path
  // e.g. vscode.getRemoteUrl(uri)
  return `/remote/${uri}`
}
