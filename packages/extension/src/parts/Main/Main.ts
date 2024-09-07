import * as WebViewProvider from '../WebViewProvider/WebViewProvider.ts'

export const activate = () => {
  // @ts-ignore
  vscode.registerWebViewProvider(WebViewProvider.webViewProvider)
}
