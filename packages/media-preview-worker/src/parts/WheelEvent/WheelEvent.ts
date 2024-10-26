import * as IsFirefox from '../IsFirefox/IsFirefox.ts'

export const normalizeDelta = (delta: number): number => {
  if (IsFirefox.isFirefox) {
    return delta * (52 / 114)
  }
  return delta
}
