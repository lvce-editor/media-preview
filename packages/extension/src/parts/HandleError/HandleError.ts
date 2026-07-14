import type { WebView } from '../WebView/WebView.ts'
import * as WebViewStates from '../WebViewStates/WebViewStates.ts'

export const handleError = (id: number): void => {
  const webView = WebViewStates.get(id)
  const newWebView: WebView = {
    ...webView,
    error: true,
  }
  WebViewStates.set(id, newWebView)
}
