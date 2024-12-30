import * as Create from '../Create/Create.ts'
import * as Create2 from '../Create2/Create2.ts'
import * as GetState from '../GetState/GetState.ts'
import * as GetUrl from '../GetUrl/GetUrl.ts'
import * as HandleError from '../HandleError/HandleError.ts'
import * as HandlePointerDown from '../HandlePointerDown/HandlePointerDown.ts'
import * as HandlePointerMove from '../HandlePointerMove/HandlePointerMove.ts'
import * as HandlePointerUp from '../HandlePointerUp/HandlePointerUp.ts'
import * as HandleWheel from '../HandleWheel/HandleWheel.ts'
import { id } from '../Id/Id.ts'
import * as SaveState from '../SaveState/SaveState.ts'
import * as SetSavedState from '../SetSavedState/SetSavedState.ts'
import * as DomMatrix from '../DomMatrix/DomMatrix.ts'
import { WebView } from '../WebView/WebView.ts'

interface SerializedState {
  readonly domMatrixString: string
  readonly pointerDown: boolean
  readonly error: boolean
}

const serializeState = (state: WebView): SerializedState => {
  const { domMatrix, pointerDown, error } = state
  return {
    domMatrixString: DomMatrix.toString(domMatrix),
    pointerDown,
    error,
  }
}

const wrapCommand = (fn) => {
  return async (...args) => {
    const newState = await fn(id, ...args)
    const { port } = newState
    const serializedState = serializeState(newState)
    // TODO don't send seriazlied state on every update,
    // only send the parts that need to be changed
    await port.invoke('update', serializedState)
  }
}

export const commandMap = {
  'WebView.create': Create2.create,
  'WebView.saveState': SaveState.saveState,
  handlePointerDown: wrapCommand(HandlePointerDown.handlePointerDown),
  handlePointerMove: wrapCommand(HandlePointerMove.handlePointerMove),
  handlePointerUp: wrapCommand(HandlePointerUp.handlePointerUp),
  handleWheel: wrapCommand(HandleWheel.handleWheel),

  // TODO this api looks better / better organized
  'MediaPreview.create': Create.create,
  'MediaPreview.getState': GetState.getState,
  'MediaPreview.getUrl': GetUrl.getUrl,
  'MediaPreview.handleError': HandleError.handleError,
  'MediaPreview.handlePointerDown': HandlePointerDown.handlePointerDown,
  'MediaPreview.handlePointerMove': HandlePointerMove.handlePointerMove,
  'MediaPreview.handlePointerUp': HandlePointerUp.handlePointerUp,
  'MediaPreview.handleWheel': HandleWheel.handleWheel,
  'MediaPreview.saveState': SaveState.saveState,
  'MediaPreview.setSavedState': SetSavedState.setSavedState,
}
