export interface WebView {
  readonly domMatrix: DOMMatrixReadOnly
  readonly error: boolean
  readonly maxZoom: number
  readonly minZoom: number
  readonly pointerDown: boolean
  readonly pointerOffsetX: number
  readonly pointerOffsetY: number
  readonly zoomFactor: 200
}
