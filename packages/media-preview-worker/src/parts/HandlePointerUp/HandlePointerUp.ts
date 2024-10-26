import type { WebView } from '../WebView/WebView.ts'
import * as WebViewStates from '../WebViewStates/WebViewStates.ts'

export const handlePointerUp = (id: number, x: number, y: number): void => {
  const state = WebViewStates.get(id)
  const newState: WebView = {
    ...state,
    pointerDown: false,
  }
  WebViewStates.set(id, newState)
}
