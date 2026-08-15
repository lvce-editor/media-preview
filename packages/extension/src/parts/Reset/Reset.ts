import * as DomMatrix from '@lvce-editor/dom-matrix'
import type { WebView } from '../WebView/WebView.ts'
import * as WebViewStates from '../WebViewStates/WebViewStates.ts'

export const reset = (id: number): void => {
  const webView = WebViewStates.get(id)
  const newWebView: WebView = {
    ...webView,
    domMatrix: DomMatrix.create(),
    pointerDown: false,
    pointerOffsetX: 0,
    pointerOffsetY: 0,
  }
  WebViewStates.set(id, newWebView)
}
