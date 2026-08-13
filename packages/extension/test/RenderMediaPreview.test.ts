import { expect, test } from '@jest/globals'
import { mergeClassNames, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import { render } from '../src/parts/RenderMediaPreview/RenderMediaPreview.ts'
import * as TabIndex from '../src/parts/TabIndex/TabIndex.ts'

const state = {
  canOpenAsText: false,
  domMatrixString: 'matrix(1, 0, 0, 1, 10, 20)',
  error: false,
  errorMessage: '',
  fileSize: 873,
  height: 1,
  isFullResolution: true,
  pointerDown: false,
  scale: 1,
  sourceHeight: 1,
  sourceWidth: 1,
  url: '/remote/image.png',
  width: 1,
}

test('renders the image inside a wrapper', () => {
  const dom = render(state)

  expect(dom).toEqual([
    {
      childCount: 1,
      className: 'MediaPreview',
      onKeyDown: 'handleMediaPreviewKeyDown',
      onPointerDown: 'handleMediaPreviewPointerDown',
      onWheel: 'handleMediaPreviewWheel',
      tabIndex: TabIndex.Focusable,
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
      decoding: 'async',
      draggable: false,
      height: 1,
      name: 'image',
      onContextMenu: 'handleContextMenu',
      onError: 'handleMediaPreviewImageError',
      onLoad: 'handleMediaPreviewImageLoad',
      src: '/remote/image.png',
      type: VirtualDomElements.Img,
      width: 1,
    },
  ])
})

test('renders an error without an image', () => {
  const dom = render({
    ...state,
    error: true,
    errorMessage: 'Image could not be found',
  })

  expect(dom).toEqual([
    {
      childCount: 1,
      className: 'MediaPreview',
      onKeyDown: 'handleMediaPreviewKeyDown',
      tabIndex: TabIndex.Focusable,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: 'MediaPreviewError',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: 'MediaPreviewErrorMessage',
      type: VirtualDomElements.Span,
    },
    {
      childCount: 0,
      text: 'Image could not be found',
      type: VirtualDomElements.Text,
    },
  ])
})

test('omits unknown dimensions until a non-HEIC image loads', () => {
  const dom = render({
    ...state,
    height: 0,
    width: 0,
  })
  const image = dom.at(-1)

  expect(image).not.toHaveProperty('height')
  expect(image).not.toHaveProperty('width')
})

test('renders an open in text editor button for text-based images', () => {
  const dom = render({
    ...state,
    canOpenAsText: true,
    error: true,
  })

  expect(dom).toContainEqual({
    childCount: 1,
    className: mergeClassNames('Button', 'ButtonSecondary', 'MediaPreviewOpenInTextEditor'),
    name: 'openInTextEditor',
    onClick: 'handleOpenInTextEditor',
    type: VirtualDomElements.Button,
  })
  expect(dom).toContainEqual({
    childCount: 0,
    text: 'Open in Text Editor',
    type: VirtualDomElements.Text,
  })
})

test('renders the dragging class while the pointer is down', () => {
  const dom = render({
    ...state,
    pointerDown: true,
  })

  expect(dom[0].className).toBe('MediaPreview MediaPreviewDragging')
})
