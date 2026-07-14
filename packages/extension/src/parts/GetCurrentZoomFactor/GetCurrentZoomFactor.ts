export const getCurrentZoomFactor = (zoomFactor: number, deltaY: number): number => {
  const normalizedDeltaY = 1 + Math.abs(deltaY) / zoomFactor
  const currentZoomFactor = deltaY < 0 ? normalizedDeltaY : 1 / normalizedDeltaY
  return currentZoomFactor
}
