import * as PreviewStates from '../PreviewStates/PreviewStates.ts'
import * as DomMatrix from '../DomMatrix/DomMatrix.ts'
import type { PreviewState } from '../PreviewState/PreviewState.ts'

export const create = (id: number): PreviewState => {
  const preview: PreviewState = {
    domMatrix: DomMatrix.create(),
    pointerOffsetX: 0,
    pointerOffsetY: 0,
  }
  PreviewStates.set(id, preview)
  return preview
}
