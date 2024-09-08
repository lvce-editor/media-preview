import * as PreviewState from '../PreviewState/PreviewState.ts'

export const create = (id: number) => {
  const preview = {
    x: 0,
    y: 0,
  }
  PreviewState.set(id, preview)
}
