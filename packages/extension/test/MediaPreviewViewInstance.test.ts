import type { ViewContext } from '@lvce-editor/api'
import { expect, jest, test } from '@jest/globals'
import { createInstanceWithApi } from '../src/parts/MediaPreviewViewInstance/MediaPreviewViewInstance.ts'

const initialState = {
  domMatrixString: 'matrix(1, 0, 0, 1, 0, 0)',
  error: false,
  pointerDown: false,
}

const createApi = () => {
  return {
    create: jest.fn((_id: number) => {}),
    dispose: jest.fn((_id: number) => {}),
    getState: jest.fn((_id: number) => initialState),
    getUrl: jest.fn((_uri: string) => '/remote/workspace/image.png'),
    handleError: jest.fn((_id: number) => ({ ...initialState, error: true })),
    handlePointerDown: jest.fn((_id: number, _x: number, _y: number) => ({ ...initialState, pointerDown: true })),
    handlePointerMove: jest.fn((_id: number, _x: number, _y: number) => initialState),
    handlePointerUp: jest.fn((_id: number, _x: number, _y: number) => initialState),
    handleWheel: jest.fn((_id: number, _eventX: number, _eventY: number, _deltaX: number, _deltaY: number) => initialState),
    saveState: jest.fn((_id: number) => ({ domMatrix: initialState.domMatrixString })),
    setSavedState: jest.fn((_id: number, _state: unknown) => {}),
  }
}

const context = {
  state: undefined,
  uid: 7,
  uri: '/workspace/image.png',
  viewId: 'builtin.media-preview',
} as unknown as ViewContext

test('creates a preview and renders its image', async () => {
  const api = createApi()
  const instance = await createInstanceWithApi(context, api)

  expect(api.create).toHaveBeenCalledWith(7)
  expect(api.setSavedState).toHaveBeenCalledWith(7, undefined)
  expect(api.getState).toHaveBeenCalledWith(7)
  expect(api.getUrl).toHaveBeenCalledWith('/workspace/image.png')
  expect(instance.render().some((node) => node.src === '/remote/workspace/image.png')).toBe(true)
})

test('forwards pointer and image events to the media preview api', async () => {
  const api = createApi()
  const instance = await createInstanceWithApi(context, api)

  await instance.handleEvent?.({ name: 'pointerdown', type: 'contextmenu', x: 10, y: 20 })
  expect(api.handlePointerDown).toHaveBeenCalledWith(7, 10, 20)
  expect(instance.render()[0].className).toBe('MediaPreview MediaPreviewDragging')

  await instance.handleEvent?.({ name: 'image', type: 'error' })
  expect(api.handleError).toHaveBeenCalledWith(7)
  expect(instance.render().some((node) => node.text === 'Image could not be loaded')).toBe(true)
})

test('saves the URI with preview state and disposes the preview instance', async () => {
  const api = createApi()
  const instance = await createInstanceWithApi(context, api)

  await expect(instance.saveState()).resolves.toEqual({
    domMatrix: initialState.domMatrixString,
    uri: '/workspace/image.png',
  })
  await instance.dispose?.()
  expect(api.dispose).toHaveBeenCalledWith(7)
})
