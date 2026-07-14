import type { ViewContext, ViewEvent, VirtualDomViewInstance } from '@lvce-editor/api'
import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import * as MediaPreview from '../MediaPreview/MediaPreview.ts'
import { render } from '../RenderMediaPreview/RenderMediaPreview.ts'

export interface MediaPreviewState {
  readonly domMatrixString: string
  readonly error: boolean
  readonly pointerDown: boolean
  readonly url: string
}

interface MediaPreviewViewContext extends ViewContext {
  readonly uri?: string
}

export interface MediaPreviewViewInstance extends VirtualDomViewInstance {
  readonly render: () => readonly VirtualDomNode[]
  readonly saveState: () => Promise<unknown>
}

interface MediaPreviewApi {
  readonly create: (id: number) => unknown
  readonly dispose: (id: number) => unknown
  readonly getState: (id: number) => Omit<MediaPreviewState, 'url'>
  readonly getUrl: (uri: string) => string
  readonly handleError: (id: number) => Partial<MediaPreviewState>
  readonly handlePointerDown: (id: number, x: number, y: number) => Partial<MediaPreviewState>
  readonly handlePointerMove: (id: number, x: number, y: number) => Partial<MediaPreviewState>
  readonly handlePointerUp: (id: number, x: number, y: number) => Partial<MediaPreviewState>
  readonly handleWheel: (id: number, eventX: number, eventY: number, deltaX: number, deltaY: number) => Partial<MediaPreviewState>
  readonly saveState: (id: number) => unknown
  readonly setSavedState: (id: number, state: unknown) => unknown
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

export const createInstanceWithApi = async (
  context: ViewContext | undefined,
  api: MediaPreviewApi,
): Promise<MediaPreviewViewInstance> => {
  const viewContext: MediaPreviewViewContext | undefined = context
  const id = viewContext?.uid ?? 0
  const uri = getUri(viewContext)
  api.create(id)
  api.setSavedState(id, context?.state)
  const previewState = api.getState(id)
  const url = uri ? api.getUrl(uri) : ''
  let state: MediaPreviewState = {
    ...previewState,
    error: !url || previewState.error,
    url,
  }

  const updateState = (newState: Partial<MediaPreviewState>): void => {
    state = {
      ...state,
      ...newState,
    }
  }

  return {
    dispose(): void {
      api.dispose(id)
    },
    handleEvent(event: Readonly<ViewEvent>): void {
      if (event.type === 'error') {
        updateState(api.handleError(id))
        return
      }
      if (event.type !== 'contextmenu') {
        return
      }
      const x = getNumber(event.x)
      const y = getNumber(event.y)
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
    render(): readonly VirtualDomNode[] {
      return render(state)
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
