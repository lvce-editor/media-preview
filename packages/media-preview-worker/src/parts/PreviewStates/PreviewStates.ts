export const previews = Object.create(null)

export const set = (id, preview) => {
  previews[id] = preview
}

export const get = (id: number) => {
  return previews[id]
}
