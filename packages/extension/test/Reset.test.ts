import { beforeAll, expect, test } from '@jest/globals'
import type { WebView } from '../src/parts/WebView/WebView.ts'
import * as Reset from '../src/parts/Reset/Reset.ts'
import * as WebViewStates from '../src/parts/WebViewStates/WebViewStates.ts'

beforeAll(() => {
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
  }
})

test('resets zoom, drag offset, and pointer state', () => {
  const id = 1
  const state: WebView = {
    domMatrix: { a: 2, b: 0, c: 0, d: 2, e: 10, f: 20 } as DOMMatrixReadOnly,
    error: false,
    isFirefox: false,
    maxZoom: 2 ** 15,
    minZoom: 0.1,
    pointerDown: true,
    pointerOffsetX: 30,
    pointerOffsetY: 40,
    zoomFactor: 200,
  }
  WebViewStates.set(id, state)

  Reset.reset(id)

  expect(WebViewStates.get(id)).toEqual({
    ...state,
    domMatrix: {
      a: 1,
      b: 0,
      c: 0,
      d: 1,
      e: 0,
      f: 0,
    },
    pointerDown: false,
    pointerOffsetX: 0,
    pointerOffsetY: 0,
  })
})
