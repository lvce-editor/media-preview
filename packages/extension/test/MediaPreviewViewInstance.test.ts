import type { ViewContext } from '@lvce-editor/api'
import { expect, jest, test } from '@jest/globals'
import type { ImageSource } from '../src/parts/ImageSource/ImageSource.ts'
import { createInstanceWithApi } from '../src/parts/MediaPreviewViewInstance/MediaPreviewViewInstance.ts'

const initialState = {
  domMatrixString: 'matrix(1, 0, 0, 1, 0, 0)',
  error: false,
  pointerDown: false,
  scale: 1,
}

const source = (url: string, options: Partial<ImageSource> = {}): ImageSource => ({
  height: 0,
  isFullResolution: true,
  originalHeight: 0,
  originalWidth: 0,
  owned: Boolean(url),
  tier: 'full',
  url,
  width: 0,
  ...options,
})

type MediaPreviewApi = Parameters<typeof createInstanceWithApi>[1]

type MockMediaPreviewApi = {
  readonly [Key in keyof MediaPreviewApi]: jest.Mock<MediaPreviewApi[Key]>
}

const createApi = (): MockMediaPreviewApi => {
  return {
    create: jest.fn((_id: number) => {}),
    dispose: jest.fn((_id: number) => {}),
    exists: jest.fn(async (_uri: string) => true),
    getFileSize: jest.fn(async (_uri: string) => 512_596),
    getFullResolutionUrl: jest.fn(async (_uri: string) => source('blob:https://example.com/full-id')),
    getSiblingImageUris: jest.fn(async (uri: string) => [uri]),
    getState: jest.fn((_id: number) => initialState),
    getUrl: jest.fn(async (_uri: string) => source('blob:https://example.com/image-id')),
    handleError: jest.fn((_id: number) => ({ ...initialState, error: true })),
    handlePointerDown: jest.fn((_id: number, _x: number, _y: number) => ({ ...initialState, pointerDown: true })),
    handlePointerMove: jest.fn((_id: number, _x: number, _y: number) => initialState),
    handlePointerUp: jest.fn((_id: number, _x: number, _y: number) => initialState),
    handleWheel: jest.fn((_id: number, _eventX: number, _eventY: number, _deltaX: number, _deltaY: number) => initialState),
    reset: jest.fn((_id: number) => initialState),
    revokeUrl: jest.fn((_url: string) => {}),
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
  expect(api.getFileSize).toHaveBeenCalledWith('/workspace/image.png')
  expect(api.getUrl).toHaveBeenCalledWith('/workspace/image.png')
  expect(instance.render().some((node) => node.src === 'blob:https://example.com/image-id')).toBe(true)
  expect(instance.getCss()).toBe(`.MediaPreview {
  --MediaPreviewTransform: matrix(1, 0, 0, 1, 0, 0);
}`)
})

test('navigates to the next and previous image and resets the preview state', async () => {
  const api = createApi()
  api.getSiblingImageUris.mockResolvedValue(['/workspace/image1.png', '/workspace/image2.png', '/workspace/image10.png'])
  api.getUrl.mockImplementation(async (uri: string) => source(`blob:${uri}`))
  api.getFileSize.mockImplementation(async (uri: string) => (uri.endsWith('image2.png') ? 200 : 100))
  api.handleWheel.mockReturnValue({
    ...initialState,
    domMatrixString: 'matrix(2, 0, 0, 2, 10, 20)',
  })
  const image2Context = {
    ...context,
    uri: '/workspace/image2.png',
  } as unknown as ViewContext
  const instance = await createInstanceWithApi(image2Context, api)
  instance.handleMediaPreviewWheel(70, 0, 0, 0, 0)

  await instance.handleMediaPreviewKeyDown('ArrowRight')

  expect(api.getSiblingImageUris).toHaveBeenCalledTimes(1)
  expect(api.getSiblingImageUris).toHaveBeenCalledWith('/workspace/image2.png')
  expect(api.create).toHaveBeenCalledTimes(2)
  expect(api.getUrl).toHaveBeenLastCalledWith('/workspace/image10.png')
  expect(instance.render().some((node) => node.src === 'blob:/workspace/image10.png')).toBe(true)
  expect(instance.getCss()).toBe(`.MediaPreview {
  --MediaPreviewTransform: matrix(1, 0, 0, 1, 0, 0);
}`)

  await instance.handleMediaPreviewKeyDown('ArrowLeft')

  expect(api.getSiblingImageUris).toHaveBeenCalledTimes(1)
  expect(api.getUrl).toHaveBeenLastCalledWith('/workspace/image2.png')
  expect(instance.renderStatusBarItems()[1]?.text).toBe('200 B')
})

test('does nothing at image boundaries or for unrelated keys', async () => {
  const api = createApi()
  api.getSiblingImageUris.mockResolvedValue(['/workspace/image.png', '/workspace/next.png'])
  const instance = await createInstanceWithApi(context, api)

  await instance.handleMediaPreviewKeyDown('ArrowLeft')
  await instance.handleMediaPreviewKeyDown('ArrowUp')

  expect(api.create).toHaveBeenCalledTimes(1)
  expect(api.getUrl).toHaveBeenCalledTimes(1)

  await instance.handleMediaPreviewKeyDown('ArrowRight')
  await instance.handleMediaPreviewKeyDown('ArrowRight')

  expect(api.create).toHaveBeenCalledTimes(2)
  expect(api.getUrl).toHaveBeenCalledTimes(2)
})

test('does nothing when sibling discovery fails', async () => {
  const api = createApi()
  api.getSiblingImageUris.mockRejectedValue(new Error('filesystem unavailable'))
  const instance = await createInstanceWithApi(context, api)

  await instance.handleMediaPreviewKeyDown('ArrowRight')

  expect(api.create).toHaveBeenCalledTimes(1)
  expect(api.getUrl).toHaveBeenCalledTimes(1)
})

test('renders a load error when the image URL cannot be read but the file exists', async () => {
  const api = createApi()
  api.getUrl.mockResolvedValue(source(''))

  const instance = await createInstanceWithApi(context, api)

  expect(api.exists).toHaveBeenCalledWith('file:///workspace/image.png')
  expect(instance.render().some((node) => node.text === 'Image could not be loaded')).toBe(true)
})

test('renders a not found error when the image URL cannot be read and the file is missing', async () => {
  const api = createApi()
  api.exists.mockResolvedValue(false)
  api.getUrl.mockResolvedValue(source(''))

  const instance = await createInstanceWithApi(context, api)

  expect(instance.render().some((node) => node.text === 'Image could not be found')).toBe(true)
})

test('falls back to a load error when checking whether the image exists fails', async () => {
  const api = createApi()
  api.exists.mockRejectedValue(new Error('filesystem unavailable'))
  api.getUrl.mockResolvedValue(source(''))

  const instance = await createInstanceWithApi(context, api)

  expect(instance.render().some((node) => node.text === 'Image could not be loaded')).toBe(true)
})

test('opens an invalid svg in the text editor', async () => {
  const api = createApi()
  api.getUrl.mockResolvedValue(source(''))
  const execute = jest.fn(async (_id: string, ..._args: readonly unknown[]) => {})
  const svgContext = {
    ...context,
    uri: '/workspace/image.SVG',
  } as unknown as ViewContext
  const instance = await createInstanceWithApi(svgContext, api, execute)

  expect(instance.render().some((node) => node.text === 'Open in Text Editor')).toBe(true)
  await instance.handleOpenInTextEditor()

  expect(execute).toHaveBeenCalledWith('Main.reopenEditorWith', 'editor')
})

test('restores the URI from saved state when there is no current URI', async () => {
  const api = createApi()
  const savedContext = {
    state: {
      uri: '/workspace/saved-image.png',
    },
    uid: 8,
    viewId: 'builtin.media-preview',
  } as unknown as ViewContext

  await createInstanceWithApi(savedContext, api)

  expect(api.getUrl).toHaveBeenCalledWith('/workspace/saved-image.png')
})

test('uses defaults when the view context is missing', async () => {
  const api = createApi()

  const instance = await createInstanceWithApi(undefined, api)

  expect(api.create).toHaveBeenCalledWith(0)
  expect(api.setSavedState).toHaveBeenCalledWith(0, undefined)
  expect(api.getUrl).not.toHaveBeenCalled()
  expect(api.getFileSize).not.toHaveBeenCalled()
  expect(api.exists).not.toHaveBeenCalled()
  expect(instance.render().some((node) => node.text === 'Image could not be loaded')).toBe(true)
})

test('forwards pointer and image events to the media preview api', async () => {
  const api = createApi()
  const instance = await createInstanceWithApi(context, api)

  instance.handleMediaPreviewPointerDown(0, 10, 20)
  expect(api.handlePointerDown).toHaveBeenCalledWith(7, 10, 20)
  expect(instance.render()[0].className).toBe('MediaPreview MediaPreviewDragging')

  instance.handleMediaPreviewPointerMove(30, 40)
  expect(api.handlePointerMove).toHaveBeenCalledWith(7, 30, 40)

  instance.handleMediaPreviewPointerUp(50, 60)
  expect(api.handlePointerUp).toHaveBeenCalledWith(7, 50, 60)

  instance.handleMediaPreviewWheel(70, 0, 0, 0, 0)
  expect(api.handleWheel).toHaveBeenCalledWith(7, 0, 0, 0, 70)

  await instance.handleMediaPreviewImageError('')
  expect(api.handleError).toHaveBeenCalledWith(7)
  expect(api.exists).toHaveBeenCalledWith('file:///workspace/image.png')
  expect(instance.render().some((node) => node.text === 'Image could not be loaded')).toBe(true)
})

test('renders a not found error when the image disappears before the error event', async () => {
  const api = createApi()
  const instance = await createInstanceWithApi(context, api)
  api.exists.mockResolvedValue(false)

  await instance.handleMediaPreviewImageError('')

  expect(instance.render().some((node) => node.text === 'Image could not be found')).toBe(true)
})

test('renders image dimensions and file size as status bar items', async () => {
  const api = createApi()
  const instance = await createInstanceWithApi(context, api)

  expect(instance.renderStatusBarItems()).toEqual([
    {
      ariaLabel: 'Image dimensions unavailable',
      name: 'media-preview-dimensions',
      text: '— × —',
      title: 'Image dimensions',
    },
    {
      ariaLabel: 'Image size: 501 kB',
      name: 'media-preview-size',
      text: '501 kB',
      title: 'Image size',
    },
  ])

  instance.handleMediaPreviewImageLoad('blob:https://example.com/image-id', 640, 480)

  expect(instance.renderStatusBarItems()[0]).toEqual({
    ariaLabel: 'Image dimensions: 640 by 480 pixels',
    name: 'media-preview-dimensions',
    text: '640 × 480',
    title: 'Image dimensions',
  })
})

test('normalizes invalid image dimensions', async () => {
  const api = createApi()
  const instance = await createInstanceWithApi(context, api)

  instance.handleMediaPreviewImageLoad('blob:https://example.com/image-id', Infinity, '480')

  expect(instance.renderStatusBarItems()[0]?.text).toBe('— × —')
})

test('only starts dragging for the left mouse button', async () => {
  const api = createApi()
  const instance = await createInstanceWithApi(context, api)

  instance.handleMediaPreviewPointerDown(2, 10, 20)

  expect(api.handlePointerDown).not.toHaveBeenCalled()
  expect(instance.render()[0].className).toBe('MediaPreview')
})

test('shows the image context menu and provides image commands', async () => {
  const api = createApi()
  const showContextMenu = jest.fn(async (_menuId: string, _x: number, _y: number) => {})
  const contextWithMenu = {
    ...context,
    showContextMenu,
  } as unknown as ViewContext
  const instance = await createInstanceWithApi(contextWithMenu, api)

  await instance.handleEvent?.({ name: 'image', type: 'contextmenu', x: 10, y: 20 })

  expect(showContextMenu).toHaveBeenCalledWith('mediaPreview.image', 10, 20)
  await expect(instance.getMenuEntries('unknown')).resolves.toEqual([])
  await expect(instance.getMenuEntries('mediaPreview.image')).resolves.toEqual([
    {
      args: ['/workspace/image.png'],
      command: 'ClipBoard.writeText',
      id: 'copyPath',
      label: 'Copy Path',
    },
    {
      args: ['blob:https://example.com/image-id'],
      command: 'ClipBoard.writeImageUrl',
      id: 'copyImage',
      label: 'Copy Image',
    },
    {
      args: [7, 'handleViewCommand', 'handleResetImage'],
      command: 'Viewlet.executeViewletCommand',
      flags: 6,
      id: 'resetImage',
      label: 'Reset Image',
    },
  ])
})

test('resets image zoom and drag', async () => {
  const api = createApi()
  api.handleWheel.mockReturnValue({
    ...initialState,
    domMatrixString: 'matrix(2, 0, 0, 2, 10, 20)',
  })
  const instance = await createInstanceWithApi(context, api)

  instance.handleMediaPreviewWheel(70, 0, 0, 0, 0)
  instance.handleResetImage()

  expect(api.reset).toHaveBeenCalledWith(7)
  expect(instance.getCss()).toBe(`.MediaPreview {
  --MediaPreviewTransform: matrix(1, 0, 0, 1, 0, 0);
}`)
})

test('updates the transform css without changing the virtual dom', async () => {
  const api = createApi()
  api.handleWheel.mockReturnValue({
    ...initialState,
    domMatrixString: 'matrix(2, 0, 0, 2, 10, 20)',
  })
  const instance = await createInstanceWithApi(context, api)
  const oldDom = instance.render()
  instance.handleMediaPreviewWheel(70, 0, 0, 0, 0)

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

test('saves and copies the navigated image URI', async () => {
  const api = createApi()
  api.getSiblingImageUris.mockResolvedValue(['/workspace/image.png', '/workspace/next.png'])
  const instance = await createInstanceWithApi(context, api)

  await instance.handleMediaPreviewKeyDown('ArrowRight')

  await expect(instance.saveState()).resolves.toEqual({
    domMatrix: initialState.domMatrixString,
    uri: '/workspace/next.png',
  })
  await expect(instance.getMenuEntries('mediaPreview.image')).resolves.toContainEqual({
    args: ['/workspace/next.png'],
    command: 'ClipBoard.writeText',
    id: 'copyPath',
    label: 'Copy Path',
  })
})

test('forwards legacy view events and normalizes invalid coordinates', async () => {
  const api = createApi()
  const instance = await createInstanceWithApi(context, api)

  await instance.handleEvent?.({ type: 'error' })
  expect(api.handleError).toHaveBeenCalledWith(7)

  instance.handleEvent?.({ name: 'pointerdown', type: 'contextmenu', x: Infinity, y: 20 })
  expect(api.handlePointerDown).toHaveBeenCalledWith(7, 0, 20)

  instance.handleEvent?.({ name: 'pointermove', type: 'contextmenu', x: 30, y: 40 })
  expect(api.handlePointerMove).toHaveBeenCalledWith(7, 30, 40)

  instance.handleEvent?.({ name: 'pointerup', type: 'contextmenu', x: 50, y: 60 })
  expect(api.handlePointerUp).toHaveBeenCalledWith(7, 50, 60)

  instance.handleEvent?.({ name: 'wheel', type: 'contextmenu', x: 70 })
  expect(api.handleWheel).toHaveBeenCalledWith(7, 0, 0, 0, 70)

  instance.handleEvent?.({ type: 'click' })
})

const progressivePreview = source('blob:https://example.com/preview-id', {
  height: 1536,
  isFullResolution: false,
  originalHeight: 3072,
  originalWidth: 4096,
  tier: 'preview',
  width: 2048,
})

const fullResolution = source('blob:https://example.com/full-id', {
  height: 3072,
  isFullResolution: true,
  originalHeight: 3072,
  originalWidth: 4096,
  tier: 'full',
  width: 4096,
})

test('loads full resolution once after zoom crosses the preview pixel threshold', async () => {
  const api = createApi()
  api.getUrl.mockResolvedValue(progressivePreview)
  api.getFullResolutionUrl.mockResolvedValue(fullResolution)
  api.handleWheel.mockReturnValue({
    ...initialState,
    domMatrixString: 'matrix(1.8, 0, 0, 1.8, 10, 20)',
    scale: 1.8,
  })
  const instance = await createInstanceWithApi({ ...context, uri: '/workspace/image.heic' } as unknown as ViewContext, api)

  instance.handleMediaPreviewWheel(-70, 0, 1024, 768, 1)
  instance.handleMediaPreviewWheel(-70, 0, 1024, 768, 1)
  expect(api.getFullResolutionUrl).toHaveBeenCalledTimes(1)
  await Promise.resolve()
  await Promise.resolve()

  const image = instance.render().find((node) => node.type === 17)
  expect(image).toMatchObject({
    height: 3072,
    src: 'blob:https://example.com/full-id',
    width: 4096,
  })
  expect(instance.getCss()).toContain('matrix(1.8, 0, 0, 1.8, 10, 20)')
  expect(instance.renderStatusBarItems()[0]?.text).toBe('4096 × 3072')

  instance.handleMediaPreviewImageLoad('blob:https://example.com/full-id', 4096, 3072)
  expect(api.revokeUrl).toHaveBeenCalledWith('blob:https://example.com/preview-id')
})

test('restores the preview and disables retries when the full image fails to load', async () => {
  const api = createApi()
  api.getUrl.mockResolvedValue(progressivePreview)
  api.getFullResolutionUrl.mockResolvedValue(fullResolution)
  api.handleWheel.mockReturnValue({ ...initialState, scale: 2 })
  const instance = await createInstanceWithApi({ ...context, uri: '/workspace/image.heic' } as unknown as ViewContext, api)

  instance.handleMediaPreviewWheel(-70, 0, 1024, 768, 1)
  await Promise.resolve()
  await Promise.resolve()
  await instance.handleMediaPreviewImageError('blob:https://example.com/full-id')

  expect(instance.render().some((node) => node.src === 'blob:https://example.com/preview-id')).toBe(true)
  expect(instance.render().some((node) => node.text === 'Image could not be loaded')).toBe(false)
  expect(api.revokeUrl).toHaveBeenCalledWith('blob:https://example.com/full-id')

  instance.handleMediaPreviewWheel(-70, 0, 1024, 768, 1)
  expect(api.getFullResolutionUrl).toHaveBeenCalledTimes(1)
})

test('ignores and revokes a stale upgrade after sibling navigation', async () => {
  const api = createApi()
  const full = Promise.withResolvers<ImageSource>()
  api.getUrl.mockImplementation(async (uri: string) => (uri.endsWith('.heic') ? progressivePreview : source('blob:next')))
  api.getFullResolutionUrl.mockReturnValue(full.promise)
  api.getSiblingImageUris.mockResolvedValue(['/workspace/image.heic', '/workspace/next.png'])
  api.handleWheel.mockReturnValue({ ...initialState, scale: 2 })
  const instance = await createInstanceWithApi({ ...context, uri: '/workspace/image.heic' } as unknown as ViewContext, api)

  instance.handleMediaPreviewWheel(-70, 0, 1024, 768, 1)
  await instance.handleMediaPreviewKeyDown('ArrowRight')
  full.resolve(fullResolution)
  await Promise.resolve()
  await Promise.resolve()

  expect(instance.render().some((node) => node.src === 'blob:next')).toBe(true)
  expect(api.revokeUrl).toHaveBeenCalledWith('blob:https://example.com/preview-id')
  expect(api.revokeUrl).toHaveBeenCalledWith('blob:https://example.com/full-id')
})

test('routes HEIC image copy through the full tier', async () => {
  const api = createApi()
  api.getUrl.mockResolvedValue(progressivePreview)
  api.getFullResolutionUrl.mockResolvedValue(fullResolution)
  const instance = await createInstanceWithApi({ ...context, uri: '/workspace/image.heic' } as unknown as ViewContext, api)

  const entries = await instance.getMenuEntries('mediaPreview.image')

  expect(api.getFullResolutionUrl).toHaveBeenCalledWith('/workspace/image.heic')
  expect(entries).toContainEqual({
    args: ['blob:https://example.com/full-id'],
    command: 'ClipBoard.writeImageUrl',
    id: 'copyImage',
    label: 'Copy Image',
  })
  await instance.getMenuEntries('mediaPreview.image')
  expect(api.getFullResolutionUrl).toHaveBeenCalledTimes(1)
  await instance.dispose?.()
  expect(api.revokeUrl).toHaveBeenCalledWith('blob:https://example.com/full-id')
})

test('falls back to the displayed preview when full-resolution copy conversion fails', async () => {
  const api = createApi()
  api.getUrl.mockResolvedValue(progressivePreview)
  api.getFullResolutionUrl.mockRejectedValue(new Error('conversion failed'))
  const instance = await createInstanceWithApi({ ...context, uri: '/workspace/image.heic' } as unknown as ViewContext, api)

  const entries = await instance.getMenuEntries('mediaPreview.image')

  expect(entries).toContainEqual({
    args: ['blob:https://example.com/preview-id'],
    command: 'ClipBoard.writeImageUrl',
    id: 'copyImage',
    label: 'Copy Image',
  })
})

test('revokes the displayed object URL on disposal', async () => {
  const api = createApi()
  const instance = await createInstanceWithApi(context, api)

  await instance.dispose?.()

  expect(api.revokeUrl).toHaveBeenCalledWith('blob:https://example.com/image-id')
})

test('uses the displayed URL directly for an already-full image', async () => {
  const api = createApi()
  const instance = await createInstanceWithApi(context, api)

  const entries = await instance.getMenuEntries('mediaPreview.image')

  expect(api.getFullResolutionUrl).not.toHaveBeenCalled()
  expect(entries).toContainEqual({
    args: ['blob:https://example.com/image-id'],
    command: 'ClipBoard.writeImageUrl',
    id: 'copyImage',
    label: 'Copy Image',
  })
})

test('rejects an invalid full-tier upgrade and does not retry it', async () => {
  const api = createApi()
  api.getUrl.mockResolvedValue(progressivePreview)
  api.getFullResolutionUrl.mockResolvedValue(source('', { isFullResolution: false, tier: 'preview' }))
  api.handleWheel.mockReturnValue({ ...initialState, scale: 2 })
  const instance = await createInstanceWithApi({ ...context, uri: '/workspace/image.heic' } as unknown as ViewContext, api)

  instance.handleMediaPreviewWheel(-70, 0, 1024, 768, 1)
  await Promise.resolve()
  await Promise.resolve()
  instance.handleMediaPreviewWheel(-70, 0, 1024, 768, 1)

  expect(api.getFullResolutionUrl).toHaveBeenCalledTimes(1)
  expect(instance.render().some((node) => node.src === 'blob:https://example.com/preview-id')).toBe(true)
})

test('ignores stale load and error events from replaced sources', async () => {
  const api = createApi()
  const instance = await createInstanceWithApi(context, api)

  instance.handleMediaPreviewImageLoad('blob:stale', 1, 1)
  await instance.handleMediaPreviewImageError('blob:stale')

  expect(api.handleError).not.toHaveBeenCalled()
  expect(instance.renderStatusBarItems()[0]?.text).toBe('— × —')
})

test('revokes both preview and pending full URLs when disposed during replacement', async () => {
  const api = createApi()
  api.getUrl.mockResolvedValue(progressivePreview)
  api.getFullResolutionUrl.mockResolvedValue(fullResolution)
  api.handleWheel.mockReturnValue({ ...initialState, scale: 2 })
  const instance = await createInstanceWithApi({ ...context, uri: '/workspace/image.heic' } as unknown as ViewContext, api)

  instance.handleMediaPreviewWheel(-70, 0, 1024, 768, 1)
  await Promise.resolve()
  await Promise.resolve()
  await instance.dispose?.()

  expect(api.revokeUrl).toHaveBeenCalledWith('blob:https://example.com/preview-id')
  expect(api.revokeUrl).toHaveBeenCalledWith('blob:https://example.com/full-id')
})

test('does not replace known original dimensions with decoded preview dimensions', async () => {
  const api = createApi()
  api.getUrl.mockResolvedValue(progressivePreview)
  const instance = await createInstanceWithApi({ ...context, uri: '/workspace/image.heic' } as unknown as ViewContext, api)

  instance.handleMediaPreviewImageLoad('blob:https://example.com/preview-id', 2048, 1536)

  expect(instance.renderStatusBarItems()[0]?.text).toBe('4096 × 3072')
})
