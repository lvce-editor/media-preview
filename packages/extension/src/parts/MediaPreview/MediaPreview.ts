import * as MediaPreviewWorker from '../MediaPreviewWorker/MediaPreviewWorker.ts'

export const getUrl = (uri: string) => {
  return MediaPreviewWorker.invoke('MediaPreview.getUrl', uri)
}

export const create = (id: number) => {
  return MediaPreviewWorker.invoke('MediaPreview.create', id)
}

export const setSavedState = (id: number, savedState: any) => {
  return MediaPreviewWorker.invoke('MediaPreview.setSavedState', id, savedState)
}

export const getState = (id: number) => {
  return MediaPreviewWorker.invoke('MediaPreview.getState', id)
}

export const saveState = (id: number) => {
  return MediaPreviewWorker.invoke('MediaPreview.saveState', id)
}

export const handlePointerDown = (id: number, x: number, y: number) => {
  return MediaPreviewWorker.invoke('MediaPreview.handlePointerDown', id, x, y)
}

export const handlePointerMove = (id: number, x: number, y: number) => {
  return MediaPreviewWorker.invoke('MediaPreview.handlePointerMove', id, x, y)
}

export const handlePointerUp = (id: number, x: number, y: number) => {
  return MediaPreviewWorker.invoke('MediaPreview.handlePointerUp', id, x, y)
}

export const handleWheel = (id: number, eventX: number, eventY: number, deltaX: number, deltaY: number) => {
  return MediaPreviewWorker.invoke('MediaPreview.handleWheel', id, eventX, eventY)
}
