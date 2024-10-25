import type { WebView } from '../WebView/WebView.ts'

const webViews = Object.create(null)

export const set = (id: number, preview: WebView) => {
  webViews[id] = preview
}

export const get = (id: number): WebView => {
  return webViews[id]
}
