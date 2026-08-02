import { expect, test } from '@jest/globals'
import { VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import { render } from '../src/parts/RenderMediaPreview/RenderMediaPreview.ts'

const state = {
  domMatrixString: 'matrix(1, 0, 0, 1, 10, 20)',
  error: false,
  pointerDown: false,
  url: '/remote/image.png',
}

test('renders the image inside a wrapper', () => {
  const dom = render(state)

  expect(dom).toEqual([
    {
      childCount: 1,
      className: 'MediaPreview',
      onPointerDown: 'handleMediaPreviewPointerDown',
      onWheel: 'handleMediaPreviewWheel',
      type: VirtualDomElements.Div,
    },
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
      onContextMenu: 'handleContextMenu',
      onError: 'handleMediaPreviewImageError',
      src: '/remote/image.png',
      type: VirtualDomElements.Img,
    },
  ])
})

test('renders an error without an image', () => {
  const dom = render({
    ...state,
    error: true,
  })

  expect(dom).toEqual([
    {
      childCount: 1,
      className: 'MediaPreview',
      onPointerDown: 'handleMediaPreviewPointerDown',
      onWheel: 'handleMediaPreviewWheel',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: 'MediaPreviewError',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      type: VirtualDomElements.Span,
    },
    {
      childCount: 0,
      text: 'Image could not be loaded',
      type: VirtualDomElements.Text,
    },
  ])
})

test('renders the dragging class while the pointer is down', () => {
  const dom = render({
    ...state,
    pointerDown: true,
  })

  expect(dom[0].className).toBe('MediaPreview MediaPreviewDragging')
})
