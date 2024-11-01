import { beforeAll, expect, test } from '@jest/globals'
import * as Create from '../src/parts/Create/Create.ts'
import * as HandlePointerUp from '../src/parts/HandlePointerUp/HandlePointerUp.ts'
import * as WebViewStates from '../src/parts/WebViewStates/WebViewStates.ts'

beforeAll(() => {
  // workaround for jsdom not supporting DOMMatrixReadonly
  // @ts-ignore
  globalThis.DOMMatrixReadOnly = class {
    a: number
    b: number
    c: number
    d: number
    e: number
    f: number
    constructor([a = 1, b = 0, c = 0, d = 1, e = 0, f = 0] = []) {
      this.a = a
      this.b = b
      this.c = c
      this.d = d
      this.e = e
      this.f = f
    }

    translate(deltaX = 0, deltaY = 0) {
      return new DOMMatrixReadOnly([this.a, this.b, this.c, this.d, this.e + this.a * deltaX, this.f + this.d * deltaY])
    }

    toString() {
      const { a, b, c, d, e, f } = this
      return `matrix(${a}, ${b}, ${c}, ${d}, ${e}, ${f})`
    }
  }

  // @ts-ignore
  globalThis.DOMMatrix = class {
    a: number
    b: number
    c: number
    d: number
    e: number
    f: number
    constructor([a = 1, b = 0, c = 0, d = 1, e = 0, f = 0] = []) {
      this.a = a
      this.b = b
      this.c = c
      this.d = d
      this.e = e
      this.f = f
    }

    translateSelf(deltaX = 0, deltaY = 0) {
      this.e += deltaX * this.a
      this.f += deltaY * this.d
      return this
    }

    translate(deltaX, deltaY) {
      return new DOMMatrix([this.a, this.b, this.c, this.d, this.e + this.a * deltaX, this.f + this.d * deltaY])
    }

    scaleSelf(scaleX = 1, scaleY = scaleX) {
      this.a *= scaleX
      this.d *= scaleY
      return this
    }

    multiplySelf(domMatrix) {
      const newA = this.a * domMatrix.a + this.b * domMatrix.c
      const newB = this.a * domMatrix.b + this.b * domMatrix.d
      const newC = this.c * domMatrix.a + this.d * domMatrix.c
      const newD = this.c * domMatrix.b + this.d * domMatrix.d
      const newE = this.e * domMatrix.a + this.f * domMatrix.c
      const newF = this.e * domMatrix.b + this.f * domMatrix.d
      this.a = newA
      this.b = newB
      this.c = newC
      this.d = newD
      this.e = newE
      this.f = newF
      return this
    }

    toString() {
      const { a, b, c, d, e, f } = this
      return `matrix(${a}, ${b}, ${c}, ${d}, ${e}, ${f})`
    }
  }
})

test('handlePointerUp', () => {
  const id = 1
  const x = 0
  const y = 0
  Create.create(id)
  HandlePointerUp.handlePointerUp(id, x, y)
  const newState = WebViewStates.get(id)
  expect(newState.pointerDown).toBe(false)
})
