import * as DomMatrix from '../DomMatrix/DomMatrix.ts'

export const parseDomMatrixInternal = (innerString: string): DOMMatrixReadOnly => {
  const parts = innerString.split(', ')
  if (parts.length !== 6) {
    return DomMatrix.create()
  }
  const [aString, bString, cString, dString, eString, fString] = parts
  const a = Number(aString)
  const b = Number(bString)
  const c = Number(cString)
  const d = Number(dString)
  const e = Number(eString)
  const f = Number(fString)
  if (Number.isNaN(a) || Number.isNaN(b) || Number.isNaN(c) || Number.isNaN(d) || Number.isNaN(e) || Number.isNaN(f)) {
    return DomMatrix.create()
  }
  return new DOMMatrixReadOnly([a, b, c, d, e, f])
}
