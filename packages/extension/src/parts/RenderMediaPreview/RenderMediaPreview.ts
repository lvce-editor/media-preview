import { text, VirtualDomElements, type VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import type { MediaPreviewState } from '../MediaPreviewViewInstance/MediaPreviewViewInstance.ts'

const renderError = (): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 1,
      className: 'MediaPreviewError',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      type: VirtualDomElements.Span,
    },
    text('Image could not be loaded'),
  ]
}

const renderImage = (state: Readonly<MediaPreviewState>): readonly VirtualDomNode[] => {
  const { url } = state
  return [
    {
      childCount: 1,
      className: 'MediaPreviewContent',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: 'MediaPreviewImageWrapper',
      type: VirtualDomElements.Div,
    },
    {
      alt: '',
      childCount: 0,
      className: 'MediaPreviewImage',
      draggable: false,
      name: 'image',
      onError: 'handleMediaPreviewImageError',
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
      onPointerDown: 'handleMediaPreviewPointerDown',
      onWheel: 'handleMediaPreviewWheel',
      type: VirtualDomElements.Div,
    },
    ...content,
  ]
}
