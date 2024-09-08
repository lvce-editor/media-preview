export interface PreviewState {
  readonly pointerOffsetX: number
  readonly pointerOffsetY: number
  readonly domMatrix: DOMMatrixReadOnly
  readonly pointerDown: boolean
}
