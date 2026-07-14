import type { WebView } from '../WebView/WebView.ts'
import * as Create from '../Create/Create.ts'
import * as DomMatrix from '../DomMatrix/DomMatrix.ts'
import * as GetState from '../GetState/GetState.ts'
import * as HandleError from '../HandleError/HandleError.ts'
import * as HandlePointerDown from '../HandlePointerDown/HandlePointerDown.ts'
import * as HandlePointerMove from '../HandlePointerMove/HandlePointerMove.ts'
import * as HandlePointerUp from '../HandlePointerUp/HandlePointerUp.ts'
import * as HandleWheel from '../HandleWheel/HandleWheel.ts'
import * as WebViewStates from '../WebViewStates/WebViewStates.ts'

export interface State {
  readonly domMatrixString: string
  readonly error: boolean
  readonly pointerDown: boolean
}

const serializeState = (state: WebView): State => {
  const { domMatrix, error, pointerDown } = state
  return {
    domMatrixString: DomMatrix.toString(domMatrix),
    error,
    pointerDown,
  }
}

export const create = (id: number): State => {
  return serializeState(Create.create(id))
}

export const dispose = WebViewStates.remove

export const getState = (id: number): State => {
  return serializeState(GetState.getState(id))
}

const wrapCommand = (fn: (id: number, ...params: readonly any[]) => unknown) => {
  return (id: number, ...params: readonly any[]): State => {
    fn(id, ...params)
    return getState(id)
  }
}

export { getUrl } from '../GetUrl/GetUrl.ts'
export { saveState } from '../SaveState/SaveState.ts'
export { setSavedState } from '../SetSavedState/SetSavedState.ts'
export const handleError = wrapCommand(HandleError.handleError)
export const handlePointerDown = wrapCommand(HandlePointerDown.handlePointerDown)
export const handlePointerMove = wrapCommand(HandlePointerMove.handlePointerMove)
export const handlePointerUp = wrapCommand(HandlePointerUp.handlePointerUp)
export const handleWheel = wrapCommand(HandleWheel.handleWheel)
