import * as PreviewStates from '../WebViewStates/WebViewStates.ts'
import * as DomMatrix from '../DomMatrix/DomMatrix.ts'
import type { WebView } from '../WebView/WebView.ts'

export const create = (id: number): WebView => {
  const preview: WebView = {
    domMatrix: DomMatrix.create(),
    pointerOffsetX: 0,
    pointerOffsetY: 0,
    pointerDown: false,
    minZoom: 0.1,
    maxZoom: 2 ** 15, // max value that doesn't result in degradation
    zoomFactor: 200,
    eventCache: [],
  }
  PreviewStates.set(id, preview)
  return preview
}
