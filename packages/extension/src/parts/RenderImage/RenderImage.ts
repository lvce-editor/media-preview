import { VirtualDomElements, type VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import type { MediaPreviewState } from '../MediaPreviewViewInstance/MediaPreviewViewInstance.ts'

const handleMediaPreviewImageError = 'handleMediaPreviewImageError'
const handleMediaPreviewImageLoad = 'handleMediaPreviewImageLoad'
const handleContextMenu = 'handleContextMenu'

const contentNode: VirtualDomNode = {
  childCount: 1,
  className: 'MediaPreviewContent',
  type: VirtualDomElements.Div,
}

const imageWrapperNode: VirtualDomNode = {
  childCount: 1,
  className: 'MediaPreviewImageWrapper',
  type: VirtualDomElements.Div,
}

export const renderImage = (state: Readonly<MediaPreviewState>): readonly VirtualDomNode[] => {
  const { height, url, width } = state
  const dimensions = width > 0 && height > 0 ? { height, width } : {}
  return [
    contentNode,
    imageWrapperNode,
    {
      alt: '',
      childCount: 0,
      className: 'MediaPreviewImage',
      'data-sourceUrl': url,
      decoding: 'async',
      draggable: false,
      ...dimensions,
      name: 'image',
      onContextMenu: handleContextMenu,
      onError: handleMediaPreviewImageError,
      onLoad: handleMediaPreviewImageLoad,
      src: url,
      type: VirtualDomElements.Img,
    },
  ]
}
