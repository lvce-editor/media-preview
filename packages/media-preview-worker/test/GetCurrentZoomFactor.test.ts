import { expect, test } from '@jest/globals'
import * as GetCurrentZoomFactor from '../src/parts/GetCurrentZoomFactor/GetCurrentZoomFactor.js'

test('getCurrentZoomFactor - zoom out', () => {
  const zoomFactor = 1
  const deltaY = 0.2
  expect(GetCurrentZoomFactor.getCurrentZoomFactor(zoomFactor, deltaY)).toBeCloseTo(0.83333)
})

test('getCurrentZoomFactor - zoom in', () => {
  const zoomFactor = 1
  const deltaY = -0.2
  expect(GetCurrentZoomFactor.getCurrentZoomFactor(zoomFactor, deltaY)).toBeCloseTo(1.2)
})
