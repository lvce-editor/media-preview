import * as DomMatrix from '../DomMatrix/DomMatrix.ts'
import * as PreviewStates from '../PreviewStates/PreviewStates.ts'

export const handlePointerDown = (id: number, x: number, y: number) => {
  const state = PreviewStates.get(id)
  const { pointerOffsetX, pointerOffsetY, domMatrix } = state
  const deltaX = x - pointerOffsetX
  const deltaY = y - pointerOffsetY
  const newDomMatrix = DomMatrix.move(domMatrix, deltaX, deltaY)
  const newState = {
    ...state,
    pointerOffsetX: x,
    pointerOffsetY,
    domMatrix: newDomMatrix,
  }
  PreviewStates.set(id, newState)
  return newState
}
