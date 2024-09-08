import type { PreviewState } from '../PreviewState/PreviewState.ts'

const previews = Object.create(null)

export const set = (id: number, preview: PreviewState) => {
  previews[id] = preview
}

export const get = (id: number): PreviewState => {
  return previews[id]
}
