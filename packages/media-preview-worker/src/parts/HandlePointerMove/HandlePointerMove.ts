import * as DomMatrix from '../DomMatrix/DomMatrix.ts'
import type { PreviewState } from '../PreviewState/PreviewState.ts'
import * as PreviewStates from '../PreviewStates/PreviewStates.ts'

export const handlePointerMove = (id: number, x: number, y: number): PreviewState => {
  const state = PreviewStates.get(id)
  const { pointerOffsetX, pointerOffsetY, domMatrix } = state
  const deltaX = x - pointerOffsetX
  const deltaY = y - pointerOffsetY
  const newDomMatrix = DomMatrix.move(domMatrix, deltaX, deltaY)
  const newState: PreviewState = {
    ...state,
    pointerOffsetX: x,
    pointerOffsetY: y,
    domMatrix: newDomMatrix,
  }
  PreviewStates.set(id, newState)
  return newState
}
