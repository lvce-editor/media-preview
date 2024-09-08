import * as PreviewState from '../PreviewState/PreviewState.ts'

export const handlePointerDown = (id: number, x: number, y: number) => {
  const state = PreviewState.get(id)
  return {
    ...state,
    x,
    y,
  }
}
