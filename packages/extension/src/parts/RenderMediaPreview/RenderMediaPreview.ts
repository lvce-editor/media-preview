import { text, VirtualDomElements, type VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import type { MediaPreviewState } from '../MediaPreviewViewInstance/MediaPreviewViewInstance.ts'

interface TreeNode {
  readonly children: readonly TreeNode[]
  readonly node: VirtualDomNode
}

const node = (type: number, properties: Readonly<Record<string, unknown>>, children: readonly TreeNode[] = []): TreeNode => {
  return {
    children,
    node: {
      ...properties,
      childCount: children.length,
      type,
    },
  }
}

const flatten = (tree: TreeNode): readonly VirtualDomNode[] => {
  return [tree.node, ...tree.children.flatMap(flatten)]
}

const renderError = (): TreeNode => {
  return node(VirtualDomElements.Div, { className: 'MediaPreviewError' }, [
    node(VirtualDomElements.Span, {}, [{ children: [], node: text('Image could not be loaded') }]),
  ])
}

const renderImage = (state: Readonly<MediaPreviewState>): TreeNode => {
  return node(
    VirtualDomElements.Div,
    {
      className: 'MediaPreviewContent',
      style: `transform: ${state.domMatrixString}`,
    },
    [
      node(VirtualDomElements.Img, {
        alt: '',
        className: 'MediaPreviewImage',
        draggable: false,
        name: 'image',
        onError: 'handleMediaPreviewImageError',
        src: state.url,
      }),
    ],
  )
}

export const render = (state: Readonly<MediaPreviewState>): readonly VirtualDomNode[] => {
  const className = state.pointerDown ? 'MediaPreview MediaPreviewDragging' : 'MediaPreview'
  return flatten(
    node(
      VirtualDomElements.Div,
      {
        className,
        onPointerDown: 'handleMediaPreviewPointerDown',
        onWheel: 'handleMediaPreviewWheel',
      },
      [state.error ? renderError() : renderImage(state)],
    ),
  )
}
