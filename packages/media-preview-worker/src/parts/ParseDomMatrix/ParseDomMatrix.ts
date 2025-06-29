import * as DomMatrix from '../DomMatrix/DomMatrix.ts'
import { parseDomMatrixInternal } from '../ParseDomMatrixInternal/ParseDomMatrixInternal.ts'

const prefix = 'matrix('
const postfix = ')'

export const parseDomMatrix = (domMatrixString: string): DOMMatrixReadOnly => {
  if (!domMatrixString || !domMatrixString.startsWith(prefix) || !domMatrixString.endsWith(postfix)) {
    return DomMatrix.create()
  }
  const inner = domMatrixString.slice(prefix.length, -postfix.length)
  return parseDomMatrixInternal(inner)
}
