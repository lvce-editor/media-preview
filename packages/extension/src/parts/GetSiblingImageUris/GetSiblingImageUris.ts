import { readDirWithFileTypes, type FileSystemDirent } from '@lvce-editor/api'
import { toFileUri } from '../ToFileUri/ToFileUri.ts'

type ReadDirWithFileTypes = (uri: string) => Promise<readonly FileSystemDirent[]>

interface UriParts {
  readonly baseName: string
  readonly join: (name: string) => string
  readonly parentUri: string
}

const uriSchemePattern = /^[a-z][a-z\d+.-]*:\/\//i

const decodePathSegment = (value: string): string => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

const getUrlParts = (uri: string): UriParts | undefined => {
  if (!URL.canParse(uri)) {
    return undefined
  }
  const url = new URL(uri)
  const slashIndex = url.pathname.lastIndexOf('/')
  if (slashIndex === -1) {
    return undefined
  }
  const baseName = decodePathSegment(url.pathname.slice(slashIndex + 1))
  url.pathname = url.pathname.slice(0, slashIndex + 1)
  url.hash = ''
  url.search = ''
  const parentUri = url.href
  return {
    baseName,
    join: (name: string): string => `${parentUri}${encodeURIComponent(name)}`,
    parentUri,
  }
}

const getPathParts = (uri: string): UriParts | undefined => {
  const slashIndex = uri.lastIndexOf('/')
  const backslashIndex = uri.lastIndexOf('\\')
  const separatorIndex = Math.max(slashIndex, backslashIndex)
  if (separatorIndex === -1) {
    return undefined
  }
  const parentUri = uri.slice(0, separatorIndex + 1)
  return {
    baseName: uri.slice(separatorIndex + 1),
    join: (name: string): string => `${parentUri}${name}`,
    parentUri,
  }
}

const getUriParts = (uri: string): UriParts | undefined => {
  return uriSchemePattern.test(uri) ? getUrlParts(uri) : getPathParts(uri)
}

const isImage = (name: string, imageExtensions: readonly string[]): boolean => {
  const dotIndex = name.lastIndexOf('.')
  return dotIndex !== -1 && imageExtensions.includes(name.slice(dotIndex).toLowerCase())
}

const compareNames = (a: string, b: string): number => {
  return a.localeCompare(b, 'en', { numeric: true })
}

export const getSiblingImageUrisWithDependency = async (
  uri: string,
  imageExtensions: readonly string[],
  readDirectory: ReadDirWithFileTypes,
): Promise<readonly string[]> => {
  const parts = getUriParts(uri)
  if (!parts) {
    return []
  }
  const entries = await readDirectory(toFileUri(parts.parentUri))
  const imageNames = entries
    .map((entry) => entry.name)
    .filter((name) => isImage(name, imageExtensions))
    .toSorted(compareNames)
  if (!imageNames.includes(parts.baseName)) {
    return []
  }
  return imageNames.map(parts.join)
}

export const getSiblingImageUris = (uri: string, imageExtensions: readonly string[]): Promise<readonly string[]> => {
  return getSiblingImageUrisWithDependency(uri, imageExtensions, readDirWithFileTypes)
}
