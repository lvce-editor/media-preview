import { beforeAll, expect, test } from '@jest/globals'
import * as SetSavedState from '../src/parts/SetSavedState/SetSavedState.ts'
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

    constructor([a = 1, b = 0, c = 0, d = 1, e = 0, f = 0] = []) {
      this.a = a
      this.b = b
      this.c = c
      this.d = d
      this.e = e
      this.f = f
    }
  }
})

const createState = () => ({
  domMatrix: {} as DOMMatrixReadOnly,
  error: false,
  maxZoom: 2 ** 15,
  minZoom: 0.1,
  pointerDown: false,
  pointerOffsetX: 0,
  pointerOffsetY: 0,
  zoomFactor: 200 as const,
})

test.each([
  ['missing state', undefined],
  ['missing matrix', {}],
  ['invalid matrix', { domMatrix: 1 }],
])('uses the identity matrix for %s', (_name, savedState) => {
  const id = 201
  WebViewStates.set(id, createState())

  SetSavedState.setSavedState(id, savedState)

  expect(WebViewStates.get(id).domMatrix).toEqual({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 })
})

test('restores a saved matrix', () => {
  const id = 202
  WebViewStates.set(id, createState())

  SetSavedState.setSavedState(id, { domMatrix: 'matrix(1, 0, 0, 1, 10, 20)' })

  expect(WebViewStates.get(id).domMatrix).toEqual({ a: 1, b: 0, c: 0, d: 1, e: 10, f: 20 })
})
