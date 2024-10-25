import type { WebView } from '../WebView/WebView.ts'
import * as PreviewStates from '../WebViewStates/WebViewStates.ts'

export const handlePointerUp = (id: number, x: number, y: number): WebView => {
  const state = PreviewStates.get(id)
  const newState: WebView = {
    ...state,
    pointerDown: false,
  }
  PreviewStates.set(id, newState)
  return newState
}
