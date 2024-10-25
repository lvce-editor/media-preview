// workaround for browser bug
export const stringifyDomMatrix = (domMatrix: DOMMatrix): string => {
  const { a, b, c, d, e, f } = domMatrix
  return `matrix(${a}, ${b}, ${c}, ${d}, ${e}, ${f})`
}
