import { text, VirtualDomElements, type VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import type { MediaPreviewState } from '../MediaPreviewViewInstance/MediaPreviewViewInstance.ts'

const handleMediaPreviewImageError = 'handleMediaPreviewImageError'
const handleMediaPreviewContextMenu = 'handleMediaPreviewContextMenu'
const handleMediaPreviewPointerDown = 'handleMediaPreviewPointerDown'
const handleMediaPreviewWheel = 'handleMediaPreviewWheel'

const errorNode: VirtualDomNode = {
  childCount: 1,
  className: 'MediaPreviewError',
  type: VirtualDomElements.Div,
}

const errorMessageNode: VirtualDomNode = {
  childCount: 1,
  type: VirtualDomElements.Span,
}

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

const renderError = (): readonly VirtualDomNode[] => {
  return [errorNode, errorMessageNode, text('Image could not be loaded')]
}

const renderImage = (state: Readonly<MediaPreviewState>): readonly VirtualDomNode[] => {
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
      onContextMenu: handleMediaPreviewContextMenu,
      onError: handleMediaPreviewImageError,
      src: url,
      type: VirtualDomElements.Img,
    },
  ]
}

export const render = (state: Readonly<MediaPreviewState>): readonly VirtualDomNode[] => {
  const { error, pointerDown } = state
  const className = pointerDown ? 'MediaPreview MediaPreviewDragging' : 'MediaPreview'
  const content = error ? renderError() : renderImage(state)
  return [
    {
      childCount: 1,
      className,
      onPointerDown: handleMediaPreviewPointerDown,
      onWheel: handleMediaPreviewWheel,
      type: VirtualDomElements.Div,
    },
    ...content,
  ]
}
