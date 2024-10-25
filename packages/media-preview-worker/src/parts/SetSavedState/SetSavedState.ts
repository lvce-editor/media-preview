import * as DomMatrix from '../DomMatrix/DomMatrix.ts'
import * as ParseDomMatrix from '../ParseDomMatrix/ParseDomMatrix.ts'
import type { WebView } from '../WebView/WebView.ts'
import * as WebViewStates from '../WebViewStates/WebViewStates.ts'

const getSavedDomMatrix = (savedState: any): DOMMatrixReadOnly => {
  if (savedState && savedState.domMatrix && typeof savedState.domMatrix === 'string') {
    return ParseDomMatrix.parseDomMatrix(savedState.domMatrix)
  }
  return DomMatrix.create()
}

export const setSavedState = (id: number, savedState: any): void => {
  const webView = WebViewStates.get(id)
  const domMatrix = getSavedDomMatrix(savedState)
  const newWebView: WebView = {
    ...webView,
    domMatrix,
  }
  WebViewStates.set(id, newWebView)
}
