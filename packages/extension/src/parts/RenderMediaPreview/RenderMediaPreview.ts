import { VirtualDomElements, type VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import type { MediaPreviewState } from '../MediaPreviewViewInstance/MediaPreviewViewInstance.ts'
import { renderError } from '../RenderError/RenderError.ts'
import { renderImage } from '../RenderImage/RenderImage.ts'

const handleMediaPreviewPointerDown = 'handleMediaPreviewPointerDown'
const handleMediaPreviewWheel = 'handleMediaPreviewWheel'

export const render = (state: Readonly<MediaPreviewState>): readonly VirtualDomNode[] => {
  const { error, pointerDown } = state
  const className = pointerDown ? 'MediaPreview MediaPreviewDragging' : 'MediaPreview'
  const content = error ? renderError(state) : renderImage(state)
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
