export const getMediaPreviewWorkerUrl = (): string => {
  return new URL('../../media-preview-worker/dist/mediaPreviewWorkerMain.js', import.meta.url).href
}
