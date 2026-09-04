import * as DomMatrix from '@lvce-editor/dom-matrix'
import type { WebView } from '../WebView/WebView.ts'
import * as GetCurrentZoomFactor from '../GetCurrentZoomFactor/GetCurrentZoomFactor.ts'
import * as WebViewStates from '../WebViewStates/WebViewStates.ts'
import * as WheelEvent from '../WheelEvent/WheelEvent.ts'

export const handleWheel = (id: number, eventX: number, eventY: number, deltaX: number, deltaY: number): void => {
  if (deltaY === 0) {
    return
  }
  const webView = WebViewStates.get(id)
  const { domMatrix, isFirefox, zoomFactor } = webView
  const normalizedDeltaY = WheelEvent.normalizeDelta(deltaY, isFirefox)
  const relativeX = eventX
  const relativeY = eventY
  const currentZoomFactor = GetCurrentZoomFactor.getCurrentZoomFactor(zoomFactor, normalizedDeltaY)
  const newDomMatrix = DomMatrix.zoomInto(domMatrix, currentZoomFactor, relativeX, relativeY)
  const newWebView: WebView = {
    ...webView,
    domMatrix: newDomMatrix,
  }
  WebViewStates.set(id, newWebView)
}
