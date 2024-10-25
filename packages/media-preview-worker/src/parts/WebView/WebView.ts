export interface WebView {
  readonly pointerOffsetX: number
  readonly pointerOffsetY: number
  readonly domMatrix: DOMMatrixReadOnly
  readonly pointerDown: boolean
}
