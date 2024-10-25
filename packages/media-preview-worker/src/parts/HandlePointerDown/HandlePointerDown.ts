import type { WebView } from '../WebView/WebView.ts'
import * as PreviewStates from '../WebViewStates/WebViewStates.ts'

export const handlePointerDown = (id: number, x: number, y: number): WebView => {
  const state = PreviewStates.get(id)
  const newState: WebView = {
    ...state,
    pointerOffsetX: x,
    pointerOffsetY: y,
    pointerDown: true,
  }
  PreviewStates.set(id, newState)
  return newState
}
