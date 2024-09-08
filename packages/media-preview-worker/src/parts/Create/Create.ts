import * as PreviewState from '../PreviewStates/PreviewStates.ts'
import * as DomMatrix from '../DomMatrix/DomMatrix.ts'

export const create = (id: number) => {
  const preview = {
    x: 0,
    y: 0,
    domMatrix: DomMatrix.create(),
    pointerOffsetX: 0,
    pointerOffsetY: 0,
  }
  PreviewState.set(id, preview)
}
