import { getCacheStorageItem, getFileHash, getPreference, readFileAsBlob, setCacheStorageItem } from '@lvce-editor/api'
import type { ImageConversionOptions, ImageSource, ImageTier } from '../ImageSource/ImageSource.ts'
import * as ImageConversionWorker from '../ImageConversionWorker/ImageConversionWorker.ts'
import { convertHeicToPreviewUrlWithDependencies } from './ConvertHeicToPreviewUrlCore.ts'

const convertHeicToUrl = async (uri: string, tier: ImageTier, options: ImageConversionOptions): Promise<ImageSource> => {
  return convertHeicToPreviewUrlWithDependencies(uri, tier, options, {
    convert: ImageConversionWorker.convertHeicToPreview,
    createUrl: (blob) => URL.createObjectURL(blob),
    getCacheItem: getCacheStorageItem,
    getHash: getFileHash,
    getSetting: getPreference,
    readBlob: readFileAsBlob,
    setCacheItem: setCacheStorageItem,
  })
}

export const convertHeicToPreviewUrl = async (uri: string, options: ImageConversionOptions): Promise<ImageSource> =>
  convertHeicToUrl(uri, 'preview', options)

export const convertHeicToFullResolutionUrl = async (uri: string, options: ImageConversionOptions): Promise<ImageSource> =>
  convertHeicToUrl(uri, 'full', options)
