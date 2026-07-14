export const normalizeDelta = (delta: number, isFirefox: boolean): number => {
  if (isFirefox) {
    return delta * (52 / 114)
  }
  return delta
}
