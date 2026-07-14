// workaround for browser bug
export const stringifyDomMatrix = (domMatrix: DOMMatrix | DOMMatrixReadOnly): string => {
  const { a, b, c, d, e, f } = domMatrix
  return `matrix(${a}, ${b}, ${c}, ${d}, ${e}, ${f})`
}
