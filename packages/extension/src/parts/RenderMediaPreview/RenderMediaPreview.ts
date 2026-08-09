import { mergeClassNames, text, VirtualDomElements, type VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import type { MediaPreviewState } from '../MediaPreviewViewInstance/MediaPreviewViewInstance.ts'

const handleMediaPreviewImageError = 'handleMediaPreviewImageError'
const handleMediaPreviewImageLoad = 'handleMediaPreviewImageLoad'
const handleContextMenu = 'handleContextMenu'
const handleOpenInTextEditor = 'handleOpenInTextEditor'
const handleMediaPreviewPointerDown = 'handleMediaPreviewPointerDown'
const handleMediaPreviewWheel = 'handleMediaPreviewWheel'

const errorMessageNode: VirtualDomNode = {
  childCount: 1,
  className: 'MediaPreviewErrorMessage',
  type: VirtualDomElements.Span,
}

const openInTextEditorButtonNode: VirtualDomNode = {
  childCount: 1,
  className: mergeClassNames('Button', 'ButtonSecondary', 'MediaPreviewOpenInTextEditor'),
  name: 'openInTextEditor',
  onClick: handleOpenInTextEditor,
  type: VirtualDomElements.Button,
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

const renderError = (canOpenAsText: boolean): readonly VirtualDomNode[] => {
  const errorNode: VirtualDomNode = {
    childCount: canOpenAsText ? 2 : 1,
    className: 'MediaPreviewError',
    type: VirtualDomElements.Div,
  }
  const messageNodes = [errorMessageNode, text('Image could not be loaded')]
  return canOpenAsText
    ? [errorNode, ...messageNodes, openInTextEditorButtonNode, text('Open in Text Editor')]
    : [errorNode, ...messageNodes]
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
      onContextMenu: handleContextMenu,
      onError: handleMediaPreviewImageError,
      onLoad: handleMediaPreviewImageLoad,
      src: url,
      type: VirtualDomElements.Img,
    },
  ]
}

export const render = (state: Readonly<MediaPreviewState>): readonly VirtualDomNode[] => {
  const { canOpenAsText, error, pointerDown } = state
  const className = pointerDown ? 'MediaPreview MediaPreviewDragging' : 'MediaPreview'
  const content = error ? renderError(canOpenAsText) : renderImage(state)
  const rootNode: VirtualDomNode = error
    ? {
        childCount: 1,
        className,
        type: VirtualDomElements.Div,
      }
    : {
        childCount: 1,
        className,
        onPointerDown: handleMediaPreviewPointerDown,
        onWheel: handleMediaPreviewWheel,
        type: VirtualDomElements.Div,
      }
  return [rootNode, ...content]
}
