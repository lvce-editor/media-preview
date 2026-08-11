import { expect, jest, test } from '@jest/globals'
import type { MediaPreviewViewInstance } from '../src/parts/MediaPreviewViewInstance/MediaPreviewViewInstance.ts'
import { view, viewId } from '../src/parts/MediaPreviewView/MediaPreviewView.ts'

test('contributes a virtual dom media preview view', () => {
  expect(view.id).toBe(viewId)
  expect(view.kind).toBe('virtualDom')
  expect(view.create).toBeDefined()
  expect(view.eventListeners?.find((listener) => listener.name === 'handleMediaPreviewImageLoad')?.params).toEqual([
    'handleMediaPreviewImageLoad',
    'event.currentTarget.naturalWidth',
    'event.currentTarget.naturalHeight',
  ])
  expect(view.eventListeners?.map((listener) => listener.name)).toEqual([
    'handleMediaPreviewImageError',
    'handleMediaPreviewImageLoad',
    'handleOpenInTextEditor',
    'handleMediaPreviewPointerDown',
    'handleMediaPreviewPointerMove',
    'handleMediaPreviewPointerUp',
    'handleMediaPreviewWheel',
  ])
})

test('contributes a reset image command', async () => {
  const instance = {
    handleResetImage: jest.fn(),
  } as unknown as MediaPreviewViewInstance

  const result = await view.commands?.['mediaPreview.resetImage']?.(instance)

  expect(instance.handleResetImage).toHaveBeenCalledTimes(1)
  expect(result).toBe(instance)
})
