export const create = (init = [1, 0, 0, 1, 0, 0]): DOMMatrixReadOnly => {
  return new DOMMatrixReadOnly(init)
}

export const scaleUp = (domMatrix: DOMMatrixReadOnly, deltaScale: number): DOMMatrixReadOnly => {
  return new DOMMatrixReadOnly([
    domMatrix.a * deltaScale,
    domMatrix.b,
    domMatrix.c,
    domMatrix.d * deltaScale,
    domMatrix.e,
    domMatrix.f,
  ])
}

export const scaleDown = (domMatrix: DOMMatrixReadOnly, deltaScale: number): DOMMatrixReadOnly => {
  return scaleUp(domMatrix, 1 / deltaScale)
}

export const zoomInto = (domMatrix: DOMMatrixReadOnly, zoomFactor: number, relativeX: number, relativeY: number): DOMMatrix => {
  return new DOMMatrix()
    .translateSelf(relativeX, relativeY)
    .scaleSelf(zoomFactor)
    .translateSelf(-relativeX, -relativeY)
    .multiplySelf(domMatrix)
}

// workaround for browser bug
export const toString = (domMatrix: DOMMatrixReadOnly): string => {
  const { a, b, c, d, e, f } = domMatrix
  return `matrix(${a}, ${b}, ${c}, ${d}, ${e}, ${f})`
}

export const move = (domMatrix: DOMMatrixReadOnly, deltaX: number, deltaY: number): DOMMatrixReadOnly => {
  return new DOMMatrixReadOnly([domMatrix.a, domMatrix.b, domMatrix.c, domMatrix.d, domMatrix.e + deltaX, domMatrix.f + deltaY])
}
