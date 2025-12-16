import type { WebView } from '../WebView/WebView.ts'
import * as DomMatrix from '../DomMatrix/DomMatrix.ts'
import * as WebViewStates from '../WebViewStates/WebViewStates.ts'

export const handlePointerMove = (id: number, x: number, y: number): WebView => {
  const state = WebViewStates.get(id)
  const { domMatrix, pointerOffsetX, pointerOffsetY } = state
  const deltaX = x - pointerOffsetX
  const deltaY = y - pointerOffsetY
  const newDomMatrix = DomMatrix.move(domMatrix, deltaX, deltaY)
  const newState: WebView = {
    ...state,
    domMatrix: newDomMatrix,
    pointerOffsetX: x,
    pointerOffsetY: y,
  }
  WebViewStates.set(id, newState)
  return newState
}
