import * as DomMatrix from '../DomMatrix/DomMatrix.ts'

const prefix = 'matrix('
const postfix = ')'

const parseDomMatrixInner = (innerString: string): DOMMatrixReadOnly => {
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

export const parseDomMatrix = (domMatrixString: string): DOMMatrixReadOnly => {
  if (!domMatrixString || !domMatrixString.startsWith(prefix) || !domMatrixString.endsWith(postfix)) {
    return DomMatrix.create()
  }
  const inner = domMatrixString.slice(prefix.length, -postfix.length)
  return parseDomMatrixInner(inner)
}
