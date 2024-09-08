import * as PreviewState from '../PreviewState/PreviewState.ts'
import * as DomMatrix from '../DomMatrix/DomMatrix.ts'

export const create = (id: number) => {
  const preview = {
    x: 0,
    y: 0,
    domMatrix: DomMatrix.create(),
  }
  PreviewState.set(id, preview)
}
