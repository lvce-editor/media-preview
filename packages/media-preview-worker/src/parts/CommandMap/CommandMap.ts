import * as Create from '../Create/Create.ts'
import * as GetState from '../GetState/GetState.ts'
import * as GetUrl from '../GetUrl/GetUrl.ts'
import * as HandleError from '../HandleError/HandleError.ts'
import * as HandlePointerDown from '../HandlePointerDown/HandlePointerDown.ts'
import * as HandlePointerMove from '../HandlePointerMove/HandlePointerMove.ts'
import * as HandlePointerUp from '../HandlePointerUp/HandlePointerUp.ts'
import * as HandleWheel from '../HandleWheel/HandleWheel.ts'
import * as SaveState from '../SaveState/SaveState.ts'
import * as SetSavedState from '../SetSavedState/SetSavedState.ts'

export const commandMap = {
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
