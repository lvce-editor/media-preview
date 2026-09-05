import { beforeAll, expect, test } from '@jest/globals'
import * as Create from '../src/parts/Create/Create.ts'
import * as HandlePointerDown from '../src/parts/HandlePointerDown/HandlePointerDown.ts'
import * as HandlePointerMove from '../src/parts/HandlePointerMove/HandlePointerMove.ts'
import * as MediaPreview from '../src/parts/MediaPreview/MediaPreview.ts'
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
    constructor([a = 1, b = 0, c = 0, d = 1, e = 0, f = 0]: readonly number[] = []) {
      this.a = a
      this.b = b
      this.c = c
      this.d = d
      this.e = e
      this.f = f
    }

    translate(deltaX = 0, deltaY = 0): DOMMatrixReadOnly {
      return new DOMMatrixReadOnly([this.a, this.b, this.c, this.d, this.e + this.a * deltaX, this.f + this.d * deltaY])
    }

    toString(): string {
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
    constructor([a = 1, b = 0, c = 0, d = 1, e = 0, f = 0]: readonly number[] = []) {
      this.a = a
      this.b = b
      this.c = c
      this.d = d
      this.e = e
      this.f = f
    }

    translateSelf(deltaX = 0, deltaY = 0): this {
      this.e += deltaX * this.a
      this.f += deltaY * this.d
      return this
    }

    translate(deltaX: number, deltaY: number): DOMMatrix {
      return new DOMMatrix([this.a, this.b, this.c, this.d, this.e + this.a * deltaX, this.f + this.d * deltaY])
    }

    scaleSelf(scaleX = 1, scaleY = scaleX): this {
      this.a *= scaleX
      this.d *= scaleY
      return this
    }

    multiplySelf(domMatrix: Readonly<DOMMatrix>): this {
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

    toString(): string {
      const { a, b, c, d, e, f } = this
      return `matrix(${a}, ${b}, ${c}, ${d}, ${e}, ${f})`
    }
  }
})

test('handlePointerMove - down', () => {
  const id = 1
  const downX = 0
  const downY = 0
  const x = 0
  const y = 1
  Create.create(id)
  HandlePointerDown.handlePointerDown(id, downX, downY)
  HandlePointerMove.handlePointerMove(id, x, y)
  const newState = WebViewStates.get(id)
  expect(newState.pointerOffsetX).toBe(0)
  expect(newState.pointerOffsetY).toBe(1)
  expect(newState.domMatrix).toEqual({
    a: 1,
    b: 0,
    c: 0,
    d: 1,
    e: 0,
    f: 1,
  })
})

test('component state restores the transform used by subsequent pan events', () => {
  MediaPreview.create(901)
  const state = MediaPreview.getComponentState(901)
  MediaPreview.setComponentState(901, { ...state, domMatrix: 'matrix(2, 0, 0, 2, 10, 20)' })
  MediaPreview.handlePointerDown(901, 10, 20)
  MediaPreview.handlePointerMove(901, 20, 30)
  expect(MediaPreview.getState(901).scale).toBe(2)
  expect(MediaPreview.getComponentState(901).domMatrix).toBe('matrix(2, 0, 0, 2, 20, 30)')
  MediaPreview.dispose(901)
})
