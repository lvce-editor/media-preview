import type { ViewContext, ViewEvent, VirtualDomViewInstance } from '@lvce-editor/api'
import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import * as MediaPreviewWorker from '../MediaPreviewWorker/MediaPreviewWorker.ts'
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

interface MediaPreviewWorkerApi {
  readonly invoke: (method: string, ...params: readonly unknown[]) => Promise<any>
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

export const createInstanceWithWorker = async (
  context: ViewContext | undefined,
  worker: MediaPreviewWorkerApi,
): Promise<MediaPreviewViewInstance> => {
  const viewContext: MediaPreviewViewContext | undefined = context
  const id = viewContext?.uid ?? 0
  const uri = getUri(viewContext)
  await worker.invoke('MediaPreview.create', id)
  await worker.invoke('MediaPreview.setSavedState', id, context?.state)
  const workerState = await worker.invoke('MediaPreview.getState', id)
  const url = uri ? await worker.invoke('MediaPreview.getUrl', uri) : ''
  let state: MediaPreviewState = {
    ...workerState,
    error: !url || workerState.error,
    url,
  }

  const updateState = async (method: string, ...params: readonly unknown[]): Promise<void> => {
    state = {
      ...state,
      ...(await worker.invoke(method, id, ...params)),
    }
  }

  return {
    async dispose(): Promise<void> {
      await worker.invoke('MediaPreview.dispose', id)
    },
    async handleEvent(event: Readonly<ViewEvent>): Promise<void> {
      if (event.type === 'error') {
        await updateState('MediaPreview.handleError')
        return
      }
      if (event.type !== 'contextmenu') {
        return
      }
      const x = getNumber(event.x)
      const y = getNumber(event.y)
      switch (event.name) {
        case 'pointerdown':
          await updateState('MediaPreview.handlePointerDown', x, y)
          break
        case 'pointermove':
          await updateState('MediaPreview.handlePointerMove', x, y)
          break
        case 'pointerup':
          await updateState('MediaPreview.handlePointerUp', x, y)
          break
        case 'wheel':
          await updateState('MediaPreview.handleWheel', 0, 0, 0, x)
          break
      }
    },
    render(): readonly VirtualDomNode[] {
      return render(state)
    },
    async saveState(): Promise<unknown> {
      const savedState = await worker.invoke('MediaPreview.saveState', id)
      return {
        ...savedState,
        uri,
      }
    },
  }
}

export const createInstance = (context?: ViewContext): Promise<MediaPreviewViewInstance> => {
  return createInstanceWithWorker(context, MediaPreviewWorker)
}
