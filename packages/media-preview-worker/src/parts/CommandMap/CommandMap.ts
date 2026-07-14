import type { WebView } from '../WebView/WebView.ts'
import * as Create from '../Create/Create.ts'
import * as DomMatrix from '../DomMatrix/DomMatrix.ts'
import * as GetState from '../GetState/GetState.ts'
import * as GetUrl from '../GetUrl/GetUrl.ts'
import * as HandleError from '../HandleError/HandleError.ts'
import * as HandlePointerDown from '../HandlePointerDown/HandlePointerDown.ts'
import * as HandlePointerMove from '../HandlePointerMove/HandlePointerMove.ts'
import * as HandlePointerUp from '../HandlePointerUp/HandlePointerUp.ts'
import * as HandleWheel from '../HandleWheel/HandleWheel.ts'
import * as SaveState from '../SaveState/SaveState.ts'
import * as SetSavedState from '../SetSavedState/SetSavedState.ts'
import * as WebViewStates from '../WebViewStates/WebViewStates.ts'

interface SerializedState {
  readonly domMatrixString: string
  readonly error: boolean
  readonly pointerDown: boolean
}

const serializeState = (state: WebView): SerializedState => {
  const { domMatrix, error, pointerDown } = state
  return {
    domMatrixString: DomMatrix.toString(domMatrix),
    error,
    pointerDown,
  }
}

const create = (id: number): SerializedState => {
  return serializeState(Create.create(id))
}

const getState = (id: number): SerializedState => {
  return serializeState(GetState.getState(id))
}

const wrapCommand = (fn: (id: number, ...params: readonly any[]) => unknown) => {
  return (id: number, ...params: readonly any[]): SerializedState => {
    fn(id, ...params)
    return getState(id)
  }
}

export const commandMap = {
  'MediaPreview.create': create,
  'MediaPreview.dispose': WebViewStates.remove,
  'MediaPreview.getState': getState,
  'MediaPreview.getUrl': GetUrl.getUrl,
  'MediaPreview.handleError': wrapCommand(HandleError.handleError),
  'MediaPreview.handlePointerDown': wrapCommand(HandlePointerDown.handlePointerDown),
  'MediaPreview.handlePointerMove': wrapCommand(HandlePointerMove.handlePointerMove),
  'MediaPreview.handlePointerUp': wrapCommand(HandlePointerUp.handlePointerUp),
  'MediaPreview.handleWheel': wrapCommand(HandleWheel.handleWheel),
  'MediaPreview.saveState': SaveState.saveState,
  'MediaPreview.setSavedState': SetSavedState.setSavedState,
}
