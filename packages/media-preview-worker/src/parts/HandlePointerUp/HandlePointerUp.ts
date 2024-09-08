import type { PreviewState } from '../PreviewState/PreviewState.ts'
import * as PreviewStates from '../PreviewStates/PreviewStates.ts'

export const handlePointerUp = (id: number, x: number, y: number): PreviewState => {
  const state = PreviewStates.get(id)
  const newState: PreviewState = {
    ...state,
    pointerDown: false,
  }
  PreviewStates.set(id, newState)
  return newState
}
