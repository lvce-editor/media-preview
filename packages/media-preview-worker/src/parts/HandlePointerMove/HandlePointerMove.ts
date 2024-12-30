import * as DomMatrix from '../DomMatrix/DomMatrix.ts'
import type { WebView } from '../WebView/WebView.ts'
import * as WebViewStates from '../WebViewStates/WebViewStates.ts'

export const handlePointerMove = (id: number, x: number, y: number): WebView => {
  const state = WebViewStates.get(id)
  console.log('move', id, x, y, state)
  const { pointerOffsetX, pointerOffsetY, domMatrix } = state
  const deltaX = x - pointerOffsetX
  const deltaY = y - pointerOffsetY
  const newDomMatrix = DomMatrix.move(domMatrix, deltaX, deltaY)
  const newState: WebView = {
    ...state,
    pointerOffsetX: x,
    pointerOffsetY: y,
    domMatrix: newDomMatrix,
  }
  WebViewStates.set(id, newState)
  return newState
}
