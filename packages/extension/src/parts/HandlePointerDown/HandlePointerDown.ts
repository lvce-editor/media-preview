import type { WebView } from '../WebView/WebView.ts'
import * as WebViewStates from '../WebViewStates/WebViewStates.ts'

export const handlePointerDown = (id: number, x: number, y: number): WebView => {
  const state = WebViewStates.get(id)
  const newState: WebView = {
    ...state,
    pointerDown: true,
    pointerOffsetX: x,
    pointerOffsetY: y,
  }
  WebViewStates.set(id, newState)
  return newState
}
