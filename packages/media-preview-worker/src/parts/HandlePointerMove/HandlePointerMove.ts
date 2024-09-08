import * as PreviewState from '../PreviewStates/PreviewStates.ts'

export const handlePointerMove = (id: number, x: number, y: number) => {
  const state = PreviewState.get(id)
  const newState = {
    ...state,
    x,
    y,
  }
  PreviewState.set(id, newState)
  return newState
}
