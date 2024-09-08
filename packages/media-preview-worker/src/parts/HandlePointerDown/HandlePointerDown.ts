import type { PreviewState } from '../PreviewState/PreviewState.ts'
import * as PreviewStates from '../PreviewStates/PreviewStates.ts'

export const handlePointerDown = (id: number, x: number, y: number): PreviewState => {
  const state = PreviewStates.get(id)
  const newState = {
    ...state,
    pointerOffsetX: x,
    pointerOffsetY: y,
  }
  PreviewStates.set(id, newState)
  return newState
}
