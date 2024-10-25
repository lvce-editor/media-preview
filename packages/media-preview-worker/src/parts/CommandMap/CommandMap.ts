import * as Create from '../Create/Create.ts'
import * as GetUrl from '../GetUrl/GetUrl.ts'
import * as HandlePointerDown from '../HandlePointerDown/HandlePointerDown.ts'
import * as HandlePointerMove from '../HandlePointerMove/HandlePointerMove.ts'
import * as HandlePointerUp from '../HandlePointerUp/HandlePointerUp.ts'
import * as SaveState from '../SaveState/SaveState.ts'
import * as SetSavedState from '../SetSavedState/SetSavedState.ts'

export const commandMap = {
  'MediaPreview.getUrl': GetUrl.getUrl,
  'MediaPreview.handlePointerDown': HandlePointerDown.handlePointerDown,
  'MediaPreview.handlePointerUp': HandlePointerUp.handlePointerUp,
  'MediaPreview.handlePointerMove': HandlePointerMove.handlePointerMove,
  'MediaPreview.create': Create.create,
  'MediaPreview.saveState': SaveState.saveState,
  'MediaPreview.setSavedState': SetSavedState.setSavedState,
}
