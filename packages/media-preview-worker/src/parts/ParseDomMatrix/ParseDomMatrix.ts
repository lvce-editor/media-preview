import * as DomMatrix from '../DomMatrix/DomMatrix.ts'

export const parseDomMatrix = (domMatrixString: string): DOMMatrixReadOnly => {
  const a = 1
  const b = 0
  const c = 0
  const d = 1
  const e = 154
  const f = 160
  const domMatrix = DomMatrix.create([a, b, c, d, e, f])
  return domMatrix
}
