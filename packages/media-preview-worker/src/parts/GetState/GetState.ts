import type { WebView } from '../WebView/WebView.ts'
import * as WebViewStates from '../WebViewStates/WebViewStates.ts'

export const getState = (id: number): WebView => {
  const webView = WebViewStates.get(id)
  return webView
}
