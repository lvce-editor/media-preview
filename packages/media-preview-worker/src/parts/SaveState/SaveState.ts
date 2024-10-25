import * as WebViewStates from '../WebViewStates/WebViewStates.ts'
import * as StringifyDomMatrix from '../StringifyDomMatrix/StringifyDomMatrix.ts'

export const saveState = (id: number): any => {
  const webView = WebViewStates.get(id)
  return {
    domMatrix: StringifyDomMatrix.stringifyDomMatrix(webView.domMatrix),
  }
}
