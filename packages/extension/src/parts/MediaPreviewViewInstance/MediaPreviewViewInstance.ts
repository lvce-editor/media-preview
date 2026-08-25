import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import {
  executeCommand,
  type MenuEntry,
  type StatusBarItem,
  type ViewContext,
  type ViewEvent,
  type VirtualDomViewInstance,
} from '@lvce-editor/api'
import type { ImageSource } from '../ImageSource/ImageSource.ts'
import { getCss } from '../GetCss/GetCss.ts'
import * as MediaPreview from '../MediaPreview/MediaPreview.ts'
import { render } from '../RenderMediaPreview/RenderMediaPreview.ts'
import { renderStatusBarItems } from '../RenderStatusBarItems/RenderStatusBarItems.ts'
import { shouldUpgradeImage } from '../ShouldUpgradeImage/ShouldUpgradeImage.ts'
import { toFileUri } from '../ToFileUri/ToFileUri.ts'

// cspell:ignore apng jfif

export interface MediaPreviewState {
  readonly canOpenAsText: boolean
  readonly domMatrixString: string
  readonly error: boolean
  readonly errorMessage: string
  readonly fileSize: number
  readonly height: number
  readonly imageExtensions: readonly string[]
  readonly isFullResolution: boolean
  readonly pointerDown: boolean
  readonly scale: number
  readonly sourceHeight: number
  readonly sourceWidth: number
  readonly url: string
  readonly width: number
}

interface MediaPreviewViewContext extends ViewContext {
  readonly uri?: string
}

export interface MediaPreviewViewInstance extends VirtualDomViewInstance {
  readonly getCss: () => string
  readonly getMenuEntries: (menuId: string) => Promise<readonly MenuEntry[]>
  readonly handleMediaPreviewImageError: (sourceUrl: unknown) => Promise<void>
  readonly handleMediaPreviewImageLoad: (sourceUrl: unknown, width: unknown, height: unknown) => void
  readonly handleMediaPreviewKeyDown: (key: unknown) => Promise<void>
  readonly handleMediaPreviewPointerDown: (button: unknown, x: unknown, y: unknown) => void
  readonly handleMediaPreviewPointerMove: (x: unknown, y: unknown) => void
  readonly handleMediaPreviewPointerUp: (x: unknown, y: unknown) => void
  readonly handleMediaPreviewWheel: (
    deltaY: unknown,
    deltaMode: unknown,
    containerWidth: unknown,
    containerHeight: unknown,
    devicePixelRatio: unknown,
  ) => void
  readonly handleOpenInTextEditor: () => Promise<unknown>
  readonly handleResetImage: () => void
  readonly render: () => readonly VirtualDomNode[]
  readonly renderStatusBarItems: () => readonly StatusBarItem[]
  readonly saveState: () => Promise<unknown>
}

interface MediaPreviewApi {
  readonly create: (id: number) => unknown
  readonly dispose: (id: number) => unknown
  readonly exists: (uri: string) => Promise<boolean>
  readonly getFileSize: (uri: string) => Promise<number>
  readonly getFullResolutionUrl: (uri: string) => Promise<ImageSource>
  readonly getSiblingImageUris: (uri: string, imageExtensions: readonly string[]) => Promise<readonly string[]>
  readonly getState: (id: number) => Pick<MediaPreviewState, 'domMatrixString' | 'error' | 'pointerDown' | 'scale'>
  readonly getUrl: (uri: string) => Promise<ImageSource>
  readonly handleError: (id: number) => Partial<MediaPreviewState>
  readonly handlePointerDown: (id: number, x: number, y: number) => Partial<MediaPreviewState>
  readonly handlePointerMove: (id: number, x: number, y: number) => Partial<MediaPreviewState>
  readonly handlePointerUp: (id: number, x: number, y: number) => Partial<MediaPreviewState>
  readonly handleWheel: (id: number, eventX: number, eventY: number, deltaX: number, deltaY: number) => Partial<MediaPreviewState>
  readonly reset: (id: number) => Partial<MediaPreviewState>
  readonly revokeUrl: (url: string) => void
  readonly saveState: (id: number) => unknown
  readonly setSavedState: (id: number, state: unknown) => unknown
}

type ExecuteCommand = (id: string, ...args: readonly unknown[]) => Promise<unknown>

interface PendingUpgrade {
  readonly fullSource: ImageSource
  readonly previewSource: ImageSource
}

const emptySource: ImageSource = {
  height: 0,
  isFullResolution: true,
  originalHeight: 0,
  originalWidth: 0,
  owned: false,
  tier: 'full',
  url: '',
  width: 0,
}

const getUri = (context: MediaPreviewViewContext | undefined): string => {
  if (typeof context?.uri === 'string') {
    return context.uri
  }
  const savedState = context?.state as { readonly uri?: unknown } | undefined
  return typeof savedState?.uri === 'string' ? savedState.uri : ''
}

const getNumber = (value: unknown): number => {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

const getString = (value: unknown): string => {
  return typeof value === 'string' ? value : ''
}

const imageMenuId = 'mediaPreview.image'
const imageCouldNotBeFound = 'Image could not be found'
const imageCouldNotBeLoaded = 'Image could not be loaded'

const canOpenAsText = (uri: string, errorMessage: string): boolean => {
  return errorMessage === imageCouldNotBeLoaded && uri.toLowerCase().endsWith('.svg')
}

const getImageErrorMessage = async (uri: string, exists: MediaPreviewApi['exists']): Promise<string> => {
  if (!uri) {
    return imageCouldNotBeLoaded
  }
  try {
    return (await exists(toFileUri(uri))) ? imageCouldNotBeLoaded : imageCouldNotBeFound
  } catch {
    return imageCouldNotBeLoaded
  }
}

const toSourceState = (
  source: Readonly<ImageSource>,
): Pick<MediaPreviewState, 'height' | 'isFullResolution' | 'sourceHeight' | 'sourceWidth' | 'url' | 'width'> => {
  return {
    height: source.originalHeight,
    isFullResolution: source.isFullResolution,
    sourceHeight: source.height,
    sourceWidth: source.width,
    url: source.url,
    width: source.originalWidth,
  }
}

export const createInstanceWithApi = async (
  context: ViewContext | undefined,
  api: MediaPreviewApi,
  execute: ExecuteCommand = executeCommand,
): Promise<MediaPreviewViewInstance> => {
  const viewContext: MediaPreviewViewContext | undefined = context
  const id = viewContext?.uid ?? 0
  let uri = getUri(viewContext)
  api.create(id)
  api.setSavedState(id, context?.state)
  const previewState = api.getState(id)
  const [initialSource, fileSize] = uri ? await Promise.all([api.getUrl(uri), api.getFileSize(uri)]) : [emptySource, 0]
  let currentSource = initialSource
  const error = !currentSource.url || previewState.error
  const errorMessage = error ? await getImageErrorMessage(uri, api.exists) : ''
  let state: MediaPreviewState = {
    ...previewState,
    ...toSourceState(currentSource),
    canOpenAsText: canOpenAsText(uri, errorMessage),
    error,
    errorMessage,
    fileSize,
    imageExtensions: [
      '.apng',
      '.avif',
      '.bmp',
      '.gif',
      '.heic',
      '.heif',
      '.ico',
      '.jpe',
      '.jfif',
      '.jpeg',
      '.jpg',
      '.png',
      '.svg',
      '.tif',
      '.tiff',
      '.webp',
    ],
  }
  let disposed = false
  let generation = 0
  let menuCopySource: ImageSource | undefined
  let pendingUpgrade: PendingUpgrade | undefined
  let upgradeFailed = false
  let upgradePromise: Promise<void> | undefined
  let siblingImageUrisPromise: Promise<readonly string[]> | undefined
  let navigationPromise = Promise.resolve()

  const updateState = (newState: Partial<MediaPreviewState>): void => {
    state = {
      ...state,
      ...newState,
    }
  }

  const revokeSource = (source: Readonly<ImageSource>): void => {
    if (source.owned && source.url) {
      api.revokeUrl(source.url)
    }
  }

  const releaseDisplayedSources = (): void => {
    if (pendingUpgrade) {
      revokeSource(pendingUpgrade.fullSource)
      revokeSource(pendingUpgrade.previewSource)
      pendingUpgrade = undefined
    } else {
      revokeSource(currentSource)
    }
    if (menuCopySource) {
      revokeSource(menuCopySource)
      menuCopySource = undefined
    }
    currentSource = emptySource
  }

  const getCopySource = async (): Promise<ImageSource> => {
    if (currentSource.isFullResolution) {
      return currentSource
    }
    if (menuCopySource) {
      return menuCopySource
    }
    const requestGeneration = generation
    const requestUri = uri
    try {
      const fullSource = await api.getFullResolutionUrl(requestUri)
      if (disposed || generation !== requestGeneration || uri !== requestUri) {
        revokeSource(fullSource)
        return currentSource
      }
      if (!fullSource.url || !fullSource.isFullResolution) {
        revokeSource(fullSource)
        return currentSource
      }
      menuCopySource = fullSource
      return fullSource
    } catch {
      return currentSource
    }
  }

  const handleImageError = async (sourceUrl: string): Promise<void> => {
    if (pendingUpgrade && sourceUrl === pendingUpgrade.fullSource.url) {
      const { fullSource, previewSource } = pendingUpgrade
      pendingUpgrade = undefined
      currentSource = previewSource
      upgradeFailed = true
      revokeSource(fullSource)
      updateState(toSourceState(previewSource))
      return
    }
    const { url } = state
    if (sourceUrl && sourceUrl !== url) {
      return
    }
    const errorMessage = await getImageErrorMessage(uri, api.exists)
    updateState({
      ...api.handleError(id),
      canOpenAsText: canOpenAsText(uri, errorMessage),
      errorMessage,
    })
  }

  const requestUpgrade = (): void => {
    if (disposed || upgradeFailed || upgradePromise || pendingUpgrade || currentSource.isFullResolution) {
      return
    }
    const requestGeneration = generation
    const requestUri = uri
    const previewSource = currentSource
    upgradePromise = (async (): Promise<void> => {
      try {
        const fullSource = await api.getFullResolutionUrl(requestUri)
        if (disposed || generation !== requestGeneration || uri !== requestUri || currentSource.url !== previewSource.url) {
          revokeSource(fullSource)
          return
        }
        if (!fullSource.url || !fullSource.isFullResolution) {
          revokeSource(fullSource)
          upgradeFailed = true
          return
        }
        pendingUpgrade = {
          fullSource,
          previewSource,
        }
        updateState({
          ...toSourceState(fullSource),
          height: previewSource.originalHeight,
          width: previewSource.originalWidth,
        })
      } catch {
        if (generation === requestGeneration) {
          upgradeFailed = true
        }
      } finally {
        if (generation === requestGeneration) {
          upgradePromise = undefined
        }
      }
    })()
  }

  const loadSiblingImageUris = async (): Promise<readonly string[]> => {
    const { imageExtensions } = state
    try {
      return await api.getSiblingImageUris(uri, imageExtensions)
    } catch {
      return []
    }
  }

  const getSiblingImageUris = (): Promise<readonly string[]> => {
    siblingImageUrisPromise ||= loadSiblingImageUris()
    return siblingImageUrisPromise
  }

  const navigateToSibling = async (offset: number): Promise<void> => {
    const siblingImageUris = await getSiblingImageUris()
    const currentIndex = siblingImageUris.indexOf(uri)
    const nextUri = siblingImageUris[currentIndex + offset]
    if (!nextUri || currentIndex === -1) {
      return
    }
    generation++
    releaseDisplayedSources()
    uri = nextUri
    upgradeFailed = false
    upgradePromise = undefined
    api.create(id)
    const previewState = api.getState(id)
    const [nextSource, fileSize] = await Promise.all([api.getUrl(uri), api.getFileSize(uri)])
    currentSource = nextSource
    const error = !nextSource.url || previewState.error
    const errorMessage = error ? await getImageErrorMessage(uri, api.exists) : ''
    updateState({
      ...previewState,
      ...toSourceState(nextSource),
      canOpenAsText: canOpenAsText(uri, errorMessage),
      error,
      errorMessage,
      fileSize,
    })
  }

  const queueNavigation = async (offset: number): Promise<void> => {
    const previousNavigation = navigationPromise
    const navigation = async (): Promise<void> => {
      try {
        await previousNavigation
      } catch {
        // Keep later key presses usable if an image failed to load.
      }
      await navigateToSibling(offset)
    }
    navigationPromise = navigation()
    await navigationPromise
  }

  return {
    dispose(): void {
      disposed = true
      generation++
      releaseDisplayedSources()
      api.dispose(id)
    },
    getCss(): string {
      const { domMatrixString } = state
      return getCss(domMatrixString)
    },
    async getMenuEntries(menuId: string): Promise<readonly MenuEntry[]> {
      if (menuId !== imageMenuId) {
        return []
      }
      const copySource = await getCopySource()
      return [
        {
          args: [uri],
          command: 'ClipBoard.writeText',
          id: 'copyPath',
          label: 'Copy Path',
        },
        {
          args: [copySource.url],
          command: 'ClipBoard.writeImageUrl',
          id: 'copyImage',
          label: 'Copy Image',
        },
        {
          args: [id, 'handleViewCommand', 'handleResetImage'],
          command: 'Viewlet.executeViewletCommand',
          flags: 6,
          id: 'resetImage',
          label: 'Reset Image',
        },
      ]
    },
    async handleEvent(event: Readonly<ViewEvent>): Promise<void> {
      if (event.type === 'error') {
        await handleImageError('')
        return
      }
      if (event.type !== 'contextmenu') {
        return
      }
      const x = getNumber(event.x)
      const y = getNumber(event.y)
      if (event.name === 'image') {
        await viewContext?.showContextMenu(imageMenuId, x, y)
        return
      }
      switch (event.name) {
        case 'pointerdown':
          updateState(api.handlePointerDown(id, x, y))
          break
        case 'pointermove':
          updateState(api.handlePointerMove(id, x, y))
          break
        case 'pointerup':
          updateState(api.handlePointerUp(id, x, y))
          break
        case 'wheel':
          updateState(api.handleWheel(id, 0, 0, 0, x))
          break
      }
    },
    async handleMediaPreviewImageError(sourceUrl: unknown): Promise<void> {
      await handleImageError(getString(sourceUrl))
    },
    handleMediaPreviewImageLoad(sourceUrl: unknown, width: unknown, height: unknown): void {
      const loadedUrl = getString(sourceUrl)
      if (pendingUpgrade && loadedUrl === pendingUpgrade.fullSource.url) {
        const { fullSource, previewSource } = pendingUpgrade
        pendingUpgrade = undefined
        currentSource = fullSource
        revokeSource(previewSource)
        updateState({
          ...toSourceState(fullSource),
          height: fullSource.originalHeight,
          width: fullSource.originalWidth,
        })
        return
      }
      const { url } = state
      if (loadedUrl && loadedUrl !== url) {
        return
      }
      if (!currentSource.originalWidth || !currentSource.originalHeight) {
        updateState({
          height: getNumber(height),
          width: getNumber(width),
        })
      }
    },
    async handleMediaPreviewKeyDown(key: unknown): Promise<void> {
      if (key === 'ArrowLeft') {
        await queueNavigation(-1)
      } else if (key === 'ArrowRight') {
        await queueNavigation(1)
      }
    },
    handleMediaPreviewPointerDown(button: unknown, x: unknown, y: unknown): void {
      if (button !== 0) {
        return
      }
      updateState(api.handlePointerDown(id, getNumber(x), getNumber(y)))
    },
    handleMediaPreviewPointerMove(x: unknown, y: unknown): void {
      updateState(api.handlePointerMove(id, getNumber(x), getNumber(y)))
    },
    handleMediaPreviewPointerUp(x: unknown, y: unknown): void {
      updateState(api.handlePointerUp(id, getNumber(x), getNumber(y)))
    },
    handleMediaPreviewWheel(
      deltaY: unknown,
      _deltaMode: unknown,
      containerWidth: unknown,
      containerHeight: unknown,
      devicePixelRatio: unknown,
    ): void {
      const wheelState = api.handleWheel(id, 0, 0, 0, getNumber(deltaY))
      updateState(wheelState)
      const { height, scale, sourceHeight, sourceWidth, width } = state
      if (
        shouldUpgradeImage({
          containerHeight: getNumber(containerHeight),
          containerWidth: getNumber(containerWidth),
          devicePixelRatio: getNumber(devicePixelRatio),
          originalHeight: height,
          originalWidth: width,
          previewHeight: sourceHeight,
          previewWidth: sourceWidth,
          scale,
        })
      ) {
        requestUpgrade()
      }
    },
    handleOpenInTextEditor(): Promise<unknown> {
      return execute('Main.reopenEditorWith', 'editor')
    },
    handleResetImage(): void {
      updateState(api.reset(id))
    },
    render(): readonly VirtualDomNode[] {
      return render(state)
    },
    renderStatusBarItems(): readonly StatusBarItem[] {
      return renderStatusBarItems(state)
    },
    async saveState(): Promise<unknown> {
      const savedState = api.saveState(id)
      return {
        ...(savedState as object),
        uri,
      }
    },
  }
}

export const createInstance = (context?: ViewContext): Promise<MediaPreviewViewInstance> => {
  return createInstanceWithApi(context, MediaPreview)
}
