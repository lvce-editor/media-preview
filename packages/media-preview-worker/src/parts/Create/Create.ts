import type { WebView } from '../WebView/WebView.ts'
import * as DomMatrix from '../DomMatrix/DomMatrix.ts'
import * as PreviewStates from '../WebViewStates/WebViewStates.ts'

export const create = (id: number): WebView => {
  // @ts-ignore
  const preview: WebView = {
    domMatrix: DomMatrix.create(),
    error: false,
    eventCache: [],
    maxZoom: 2 ** 15, // max value that doesn't result in degradation
    minZoom: 0.1,
    pointerDown: false,
    pointerOffsetX: 0,
    pointerOffsetY: 0,
    zoomFactor: 200,
  }
  PreviewStates.set(id, preview)
  return preview
}
