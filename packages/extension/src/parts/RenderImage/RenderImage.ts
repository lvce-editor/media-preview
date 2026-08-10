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
  const { url } = state
  return [
    contentNode,
    imageWrapperNode,
    {
      alt: '',
      childCount: 0,
      className: 'MediaPreviewImage',
      draggable: false,
      name: 'image',
      onContextMenu: handleContextMenu,
      onError: handleMediaPreviewImageError,
      onLoad: handleMediaPreviewImageLoad,
      src: url,
      type: VirtualDomElements.Img,
    },
  ]
}
