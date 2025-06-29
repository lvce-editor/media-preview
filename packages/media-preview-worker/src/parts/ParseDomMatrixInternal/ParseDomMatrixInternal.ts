import * as DomMatrix from '../DomMatrix/DomMatrix.ts'

export const parseDomMatrixInternal = (innerString: string): DOMMatrixReadOnly => {
  const parts = innerString.split(', ')
  if (parts.length !== 6) {
    return DomMatrix.create()
  }
  const [aString, bString, cString, dString, eString, fString] = parts
  const a = parseFloat(aString)
  const b = parseFloat(bString)
  const c = parseFloat(cString)
  const d = parseFloat(dString)
  const e = parseFloat(eString)
  const f = parseFloat(fString)
  if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(d) || isNaN(e) || isNaN(f)) {
    return DomMatrix.create()
  }
  return new DOMMatrixReadOnly([a, b, c, d, e, f])
}
