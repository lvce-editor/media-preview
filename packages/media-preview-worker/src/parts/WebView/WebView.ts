import type { EventCacheItem } from '../EventCacheItem/EventCacheItem.ts'

export interface WebView {
  readonly domMatrix: DOMMatrixReadOnly
  readonly error: boolean
  readonly eventCache: readonly EventCacheItem[]
  readonly maxZoom: number
  readonly minZoom: number
  readonly pointerDown: boolean
  readonly pointerOffsetX: number
  readonly pointerOffsetY: number
  readonly port: any
  readonly zoomFactor: 200
}
