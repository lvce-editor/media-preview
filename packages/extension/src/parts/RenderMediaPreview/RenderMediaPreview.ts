import { VirtualDomElements, type VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import type { MediaPreviewState } from '../MediaPreviewViewInstance/MediaPreviewViewInstance.ts'
import { renderError } from '../RenderError/RenderError.ts'
import { renderImage } from '../RenderImage/RenderImage.ts'
import * as TabIndex from '../TabIndex/TabIndex.ts'

const handleMediaPreviewPointerDown = 'handleMediaPreviewPointerDown'
const handleMediaPreviewWheel = 'handleMediaPreviewWheel'
const handleMediaPreviewKeyDown = 'handleMediaPreviewKeyDown'

export const render = (state: Readonly<MediaPreviewState>): readonly VirtualDomNode[] => {
  const { error, pointerDown } = state
  const className = pointerDown ? 'MediaPreview MediaPreviewDragging' : 'MediaPreview'
  const content = error ? renderError(state) : renderImage(state)
  const rootNode: VirtualDomNode = error
    ? {
        childCount: 1,
        className,
        onKeyDown: handleMediaPreviewKeyDown,
        tabIndex: TabIndex.Focusable,
        type: VirtualDomElements.Div,
      }
    : {
        childCount: 1,
        className,
        onKeyDown: handleMediaPreviewKeyDown,
        onPointerDown: handleMediaPreviewPointerDown,
        onWheel: handleMediaPreviewWheel,
        tabIndex: TabIndex.Focusable,
        type: VirtualDomElements.Div,
      }
  return [rootNode, ...content]
}
