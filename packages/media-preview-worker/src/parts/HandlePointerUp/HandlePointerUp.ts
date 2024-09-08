import * as PreviewState from '../PreviewStates/PreviewStates.ts'

export const handlePointerUp = (id: number, x: number, y: number) => {
  const state = PreviewState.get(id)
  return {
    ...state,
    x,
    y,
  }
}
