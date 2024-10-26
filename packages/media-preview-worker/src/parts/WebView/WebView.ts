import type { EventCacheItem } from '../EventCacheItem/EventCacheItem.ts'

export interface WebView {
  readonly pointerOffsetX: number
  readonly pointerOffsetY: number
  readonly domMatrix: DOMMatrixReadOnly
  readonly pointerDown: boolean
  readonly minZoom: number
  readonly maxZoom: number
  readonly zoomFactor: 200
  readonly eventCache: readonly EventCacheItem[]
}
