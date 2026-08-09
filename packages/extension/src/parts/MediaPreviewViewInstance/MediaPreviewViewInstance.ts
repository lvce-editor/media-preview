import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import {
  executeCommand,
  type MenuEntry,
  type StatusBarItem,
  type ViewContext,
  type ViewEvent,
  type VirtualDomViewInstance,
} from '@lvce-editor/api'
import { getCss } from '../GetCss/GetCss.ts'
import * as MediaPreview from '../MediaPreview/MediaPreview.ts'
import { render } from '../RenderMediaPreview/RenderMediaPreview.ts'
import { renderStatusBarItems } from '../RenderStatusBarItems/RenderStatusBarItems.ts'

export interface MediaPreviewState {
  readonly canOpenAsText: boolean
  readonly domMatrixString: string
  readonly error: boolean
  readonly errorMessage: string
  readonly fileSize: number
  readonly height: number
  readonly pointerDown: boolean
  readonly url: string
  readonly width: number
}

interface MediaPreviewViewContext extends ViewContext {
  readonly uri?: string
}

export interface MediaPreviewViewInstance extends VirtualDomViewInstance {
  readonly getCss: () => string
  readonly getMenuEntries: (menuId: string) => Promise<readonly MenuEntry[]>
  readonly handleMediaPreviewImageError: () => Promise<void>
  readonly handleMediaPreviewImageLoad: (width: unknown, height: unknown) => void
  readonly handleMediaPreviewPointerDown: (button: unknown, x: unknown, y: unknown) => void
  readonly handleMediaPreviewPointerMove: (x: unknown, y: unknown) => void
  readonly handleMediaPreviewPointerUp: (x: unknown, y: unknown) => void
  readonly handleMediaPreviewWheel: (deltaY: unknown, deltaMode: unknown) => void
  readonly handleOpenInTextEditor: () => Promise<unknown>
  readonly render: () => readonly VirtualDomNode[]
  readonly renderStatusBarItems: () => readonly StatusBarItem[]
  readonly saveState: () => Promise<unknown>
}

interface MediaPreviewApi {
  readonly create: (id: number) => unknown
  readonly dispose: (id: number) => unknown
  readonly exists: (uri: string) => Promise<boolean>
  readonly getFileSize: (uri: string) => Promise<number>
  readonly getState: (id: number) => Pick<MediaPreviewState, 'domMatrixString' | 'error' | 'pointerDown'>
  readonly getUrl: (uri: string) => Promise<string>
  readonly handleError: (id: number) => Partial<MediaPreviewState>
  readonly handlePointerDown: (id: number, x: number, y: number) => Partial<MediaPreviewState>
  readonly handlePointerMove: (id: number, x: number, y: number) => Partial<MediaPreviewState>
  readonly handlePointerUp: (id: number, x: number, y: number) => Partial<MediaPreviewState>
  readonly handleWheel: (id: number, eventX: number, eventY: number, deltaX: number, deltaY: number) => Partial<MediaPreviewState>
  readonly saveState: (id: number) => unknown
  readonly setSavedState: (id: number, state: unknown) => unknown
}

type ExecuteCommand = (id: string, ...args: readonly unknown[]) => Promise<unknown>

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
    return (await exists(uri)) ? imageCouldNotBeLoaded : imageCouldNotBeFound
  } catch {
    return imageCouldNotBeLoaded
  }
}

export const createInstanceWithApi = async (
  context: ViewContext | undefined,
  api: MediaPreviewApi,
  execute: ExecuteCommand = executeCommand,
): Promise<MediaPreviewViewInstance> => {
  const viewContext: MediaPreviewViewContext | undefined = context
  const id = viewContext?.uid ?? 0
  const uri = getUri(viewContext)
  api.create(id)
  api.setSavedState(id, context?.state)
  const previewState = api.getState(id)
  const [url, fileSize] = uri ? await Promise.all([api.getUrl(uri), api.getFileSize(uri)]) : ['', 0]
  const error = !url || previewState.error
  const errorMessage = error ? await getImageErrorMessage(uri, api.exists) : ''
  let state: MediaPreviewState = {
    ...previewState,
    canOpenAsText: canOpenAsText(uri, errorMessage),
    error,
    errorMessage,
    fileSize,
    height: 0,
    url,
    width: 0,
  }

  const updateState = (newState: Partial<MediaPreviewState>): void => {
    state = {
      ...state,
      ...newState,
    }
  }

  const handleImageError = async (): Promise<void> => {
    const errorMessage = await getImageErrorMessage(uri, api.exists)
    updateState({
      ...api.handleError(id),
      canOpenAsText: canOpenAsText(uri, errorMessage),
      errorMessage,
    })
  }

  return {
    dispose(): void {
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
      const { url } = state
      return [
        {
          args: [uri],
          command: 'ClipBoard.writeText',
          id: 'copyPath',
          label: 'Copy Path',
        },
        {
          args: [url],
          command: 'ClipBoard.writeImageUrl',
          id: 'copyImage',
          label: 'Copy Image',
        },
      ]
    },
    async handleEvent(event: Readonly<ViewEvent>): Promise<void> {
      if (event.type === 'error') {
        await handleImageError()
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
    async handleMediaPreviewImageError(): Promise<void> {
      await handleImageError()
    },
    handleMediaPreviewImageLoad(width: unknown, height: unknown): void {
      updateState({
        height: getNumber(height),
        width: getNumber(width),
      })
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
    handleMediaPreviewWheel(deltaY: unknown, _deltaMode: unknown): void {
      updateState(api.handleWheel(id, 0, 0, 0, getNumber(deltaY)))
    },
    handleOpenInTextEditor(): Promise<unknown> {
      return execute('Main.reopenEditorWith', 'editor')
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
