import { mergeClassNames, text, VirtualDomElements, type VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import type { MediaPreviewState } from '../MediaPreviewViewInstance/MediaPreviewViewInstance.ts'

const handleOpenInTextEditor = 'handleOpenInTextEditor'

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

export const renderError = (state: Readonly<MediaPreviewState>): readonly VirtualDomNode[] => {
  const { canOpenAsText, errorMessage } = state
  const errorNode: VirtualDomNode = {
    childCount: canOpenAsText ? 2 : 1,
    className: 'MediaPreviewError',
    type: VirtualDomElements.Div,
  }
  const messageNodes = [errorMessageNode, text(errorMessage)]
  return canOpenAsText
    ? [errorNode, ...messageNodes, openInTextEditorButtonNode, text('Open in Text Editor')]
    : [errorNode, ...messageNodes]
}
