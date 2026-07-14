import { expect, test } from '@jest/globals'
import { view, viewId } from '../src/parts/MediaPreviewView/MediaPreviewView.ts'

test('contributes a virtual dom media preview view', () => {
  expect(view.id).toBe(viewId)
  expect(view.kind).toBe('virtualDom')
  expect(view.create).toBeDefined()
  expect(view.eventListeners?.map((listener) => listener.name)).toEqual([
    'handleMediaPreviewImageError',
    'handleMediaPreviewPointerDown',
    'handleMediaPreviewPointerMove',
    'handleMediaPreviewPointerUp',
    'handleMediaPreviewWheel',
  ])
})
