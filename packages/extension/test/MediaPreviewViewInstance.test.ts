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
    getUrl: jest.fn(async (_uri: string) => 'blob:https://example.com/image-id'),
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
  expect(instance.render().some((node) => node.src === 'blob:https://example.com/image-id')).toBe(true)
  expect(instance.getCss()).toBe(`.MediaPreview {
  --MediaPreviewTransform: matrix(1, 0, 0, 1, 0, 0);
}`)
})

test('renders an error when the image URL cannot be read', async () => {
  const api = createApi()
  api.getUrl.mockResolvedValue('')

  const instance = await createInstanceWithApi(context, api)

  expect(instance.render().some((node) => node.text === 'Image could not be loaded')).toBe(true)
})

test('forwards pointer and image events to the media preview api', async () => {
  const api = createApi()
  const instance = await createInstanceWithApi(context, api)

  instance.handleMediaPreviewPointerDown(10, 20)
  expect(api.handlePointerDown).toHaveBeenCalledWith(7, 10, 20)
  expect(instance.render()[0].className).toBe('MediaPreview MediaPreviewDragging')

  instance.handleMediaPreviewPointerMove(30, 40)
  expect(api.handlePointerMove).toHaveBeenCalledWith(7, 30, 40)

  instance.handleMediaPreviewPointerUp(50, 60)
  expect(api.handlePointerUp).toHaveBeenCalledWith(7, 50, 60)

  instance.handleMediaPreviewWheel(70, 0)
  expect(api.handleWheel).toHaveBeenCalledWith(7, 0, 0, 0, 70)

  instance.handleMediaPreviewImageError()
  expect(api.handleError).toHaveBeenCalledWith(7)
  expect(instance.render().some((node) => node.text === 'Image could not be loaded')).toBe(true)
})

test('updates the transform css without changing the virtual dom', async () => {
  const api = createApi()
  api.handleWheel.mockReturnValue({
    ...initialState,
    domMatrixString: 'matrix(2, 0, 0, 2, 10, 20)',
  })
  const instance = await createInstanceWithApi(context, api)
  const oldDom = instance.render()

  instance.handleMediaPreviewWheel(70, 0)

  expect(instance.render()).toEqual(oldDom)
  expect(instance.getCss()).toBe(`.MediaPreview {
  --MediaPreviewTransform: matrix(2, 0, 0, 2, 10, 20);
}`)
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
