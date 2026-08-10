import { beforeAll, expect, test } from '@jest/globals'
import type { WebView } from '../src/parts/WebView/WebView.ts'
import * as HandleWheel from '../src/parts/HandleWheel/HandleWheel.ts'
import * as WebViewStates from '../src/parts/WebViewStates/WebViewStates.ts'

beforeAll(() => {
  // @ts-ignore
  globalThis.DOMMatrix = class {
    a = 1
    b = 0
    c = 0
    d = 1
    e = 0
    f = 0

    multiplySelf(domMatrix: Readonly<DOMMatrixReadOnly>): this {
      this.a *= domMatrix.a
      this.d *= domMatrix.d
      return this
    }

    scaleSelf(scale: number): this {
      this.a *= scale
      this.d *= scale
      return this
    }

    translateSelf(x: number, y: number): this {
      this.e += x
      this.f += y
      return this
    }
  }
})

const createState = (): WebView => ({
  domMatrix: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 } as DOMMatrixReadOnly,
  error: false,
  maxZoom: 2 ** 15,
  minZoom: 0.1,
  pointerDown: false,
  pointerOffsetX: 0,
  pointerOffsetY: 0,
  zoomFactor: 200 as const,
})

test('ignores horizontal-only wheel events', () => {
  const id = 101
  const state = createState()
  WebViewStates.set(id, state)

  HandleWheel.handleWheel(id, 10, 20, 5, 0)

  expect(WebViewStates.get(id)).toBe(state)
})

test('zooms into the pointer position for vertical wheel events', () => {
  const id = 102
  WebViewStates.set(id, createState())

  HandleWheel.handleWheel(id, 10, 20, 0, -1)

  expect(WebViewStates.get(id).domMatrix.a).toBeGreaterThan(1)
})
