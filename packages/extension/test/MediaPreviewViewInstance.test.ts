import type { ViewContext } from '@lvce-editor/api'
import { expect, jest, test } from '@jest/globals'
import { createInstanceWithWorker } from '../src/parts/MediaPreviewViewInstance/MediaPreviewViewInstance.ts'

const initialState = {
  domMatrixString: 'matrix(1, 0, 0, 1, 0, 0)',
  error: false,
  pointerDown: false,
}

const createWorker = () => {
  const invoke = jest.fn(async (method: string, ..._params: readonly unknown[]): Promise<any> => {
    switch (method) {
      case 'MediaPreview.getState':
        return initialState
      case 'MediaPreview.getUrl':
        return '/remote/workspace/image.png'
      case 'MediaPreview.handleError':
        return {
          ...initialState,
          error: true,
        }
      case 'MediaPreview.handlePointerDown':
        return {
          ...initialState,
          pointerDown: true,
        }
      case 'MediaPreview.saveState':
        return {
          domMatrix: initialState.domMatrixString,
        }
      default:
        return undefined
    }
  })
  return {
    invoke,
    worker: { invoke },
  }
}

const context = {
  state: undefined,
  uid: 7,
  uri: '/workspace/image.png',
  viewId: 'builtin.media-preview',
} as unknown as ViewContext

test('creates a worker-backed preview and renders its image', async () => {
  const { invoke, worker } = createWorker()
  const instance = await createInstanceWithWorker(context, worker)

  expect(invoke.mock.calls.slice(0, 4)).toEqual([
    ['MediaPreview.create', 7],
    ['MediaPreview.setSavedState', 7, undefined],
    ['MediaPreview.getState', 7],
    ['MediaPreview.getUrl', '/workspace/image.png'],
  ])
  expect(instance.render().some((node) => node.src === '/remote/workspace/image.png')).toBe(true)
})

test('forwards pointer and image events to the media worker', async () => {
  const { invoke, worker } = createWorker()
  const instance = await createInstanceWithWorker(context, worker)

  await instance.handleEvent?.({ name: 'pointerdown', type: 'contextmenu', x: 10, y: 20 })
  expect(invoke).toHaveBeenLastCalledWith('MediaPreview.handlePointerDown', 7, 10, 20)
  expect(instance.render()[0].className).toBe('MediaPreview MediaPreviewDragging')

  await instance.handleEvent?.({ name: 'image', type: 'error' })
  expect(invoke).toHaveBeenLastCalledWith('MediaPreview.handleError', 7)
  expect(instance.render().some((node) => node.text === 'Image could not be loaded')).toBe(true)
})

test('saves the URI with worker state and disposes the worker instance', async () => {
  const { invoke, worker } = createWorker()
  const instance = await createInstanceWithWorker(context, worker)

  await expect(instance.saveState()).resolves.toEqual({
    domMatrix: initialState.domMatrixString,
    uri: '/workspace/image.png',
  })
  await instance.dispose?.()
  expect(invoke).toHaveBeenLastCalledWith('MediaPreview.dispose', 7)
})
