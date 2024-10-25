import * as DomMatrix from '../DomMatrix/DomMatrix.ts'
import type { WebView } from '../WebView/WebView.ts'
import * as WebViewStates from '../WebViewStates/WebViewStates.ts'

const getSavedDomMatrix = (savedState: any): DOMMatrixReadOnly => {
  if (savedState && savedState.domMatrix && typeof savedState.domMatrix === 'string') {
    const maybe = new DOMMatrixReadOnly(savedState.domMatrix)
    // TODO how to verify that dom matrix is valid?
    return maybe
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
