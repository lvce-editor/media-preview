import * as DomMatrix from '@lvce-editor/dom-matrix'
import type { WebView } from '../WebView/WebView.ts'
import * as IsFirefox from '../IsFirefox/IsFirefox.ts'
import * as PreviewStates from '../WebViewStates/WebViewStates.ts'

export const create = (id: number): WebView => {
  // @ts-ignore
  const preview: WebView = {
    domMatrix: DomMatrix.create(),
    error: false,
    isFirefox: IsFirefox.getIsFirefox(),
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
