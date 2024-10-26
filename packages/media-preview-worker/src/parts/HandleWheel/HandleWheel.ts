import * as DomMatrix from '../DomMatrix/DomMatrix.ts'
import * as GetCurrentZoomFactor from '../GetCurrentZoomFactor/GetCurrentZoomFactor.ts'
import type { WebView } from '../WebView/WebView.ts'
import * as WebViewStates from '../WebViewStates/WebViewStates.ts'
import * as WheelEvent from '../WheelEvent/WheelEvent.ts'

export const handleWheel = (id: number, eventX: number, eventY: number, deltaX: number, deltaY: number): void => {
  if (deltaY === 0) {
    return
  }
  const webView = WebViewStates.get(id)
  const normalizedDeltaY = WheelEvent.normalizeDelta(deltaY)
  const relativeX = eventX
  const relativeY = eventY
  // @ts-ignore
  const { domMatrix, zoomFactor, minZoom, maxZoom } = state
  const currentZoomFactor = GetCurrentZoomFactor.getCurrentZoomFactor(zoomFactor, normalizedDeltaY)
  const newDomMatrix = DomMatrix.zoomInto(domMatrix, currentZoomFactor, relativeX, relativeY)
  const newWebView: WebView = {
    ...webView,
    domMatrix: newDomMatrix,
  }
  WebViewStates.set(id, newWebView)
}
