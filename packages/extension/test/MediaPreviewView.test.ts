import { expect, test } from '@jest/globals'
import { view, viewId } from '../src/parts/MediaPreviewView/MediaPreviewView.ts'

test('contributes a virtual dom media preview view', () => {
  expect(view.id).toBe(viewId)
  expect(view.kind).toBe('virtualDom')
  expect(view.create).toBeDefined()
  expect(view.eventListeners?.find((listener) => listener.name === 'handleMediaPreviewImageLoad')?.params).toEqual([
    'handleMediaPreviewImageLoad',
    'event.currentTarget.src',
    'event.currentTarget.naturalWidth',
    'event.currentTarget.naturalHeight',
  ])
  expect(view.eventListeners?.map((listener) => listener.name)).toEqual([
    'handleMediaPreviewImageError',
    'handleMediaPreviewImageLoad',
    'handleOpenInTextEditor',
    'handleMediaPreviewKeyDown',
    'handleMediaPreviewPointerDown',
    'handleMediaPreviewPointerMove',
    'handleMediaPreviewPointerUp',
    'handleMediaPreviewWheel',
  ])
  expect(view.eventListeners?.find((listener) => listener.name === 'handleMediaPreviewImageError')?.params).toEqual([
    'handleMediaPreviewImageError',
    'event.currentTarget.src',
  ])
  expect(view.eventListeners?.find((listener) => listener.name === 'handleMediaPreviewWheel')?.params).toEqual([
    'handleMediaPreviewWheel',
    'event.deltaY',
    'event.deltaMode',
    'event.currentTarget.clientWidth',
    'event.currentTarget.clientHeight',
    'event.currentTarget.ownerDocument.defaultView.devicePixelRatio',
  ])
  expect(view.eventListeners?.find((listener) => listener.name === 'handleMediaPreviewKeyDown')?.params).toEqual([
    'handleMediaPreviewKeyDown',
    'event.key',
  ])
})
