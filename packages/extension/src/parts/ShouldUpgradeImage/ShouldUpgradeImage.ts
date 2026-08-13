interface UpgradeImageOptions {
  readonly containerHeight: number
  readonly containerWidth: number
  readonly devicePixelRatio: number
  readonly originalHeight: number
  readonly originalWidth: number
  readonly previewHeight: number
  readonly previewWidth: number
  readonly scale: number
}

const UpgradeThreshold = 0.9

const isPositiveFiniteNumber = (value: number): boolean => {
  return Number.isFinite(value) && value > 0
}

export const shouldUpgradeImage = (options: Readonly<UpgradeImageOptions>): boolean => {
  const { containerHeight, containerWidth, devicePixelRatio, originalHeight, originalWidth, previewHeight, previewWidth, scale } =
    options
  if (
    ![containerHeight, containerWidth, devicePixelRatio, originalHeight, originalWidth, previewHeight, previewWidth, scale].every(
      isPositiveFiniteNumber,
    )
  ) {
    return false
  }
  const fittedScale = Math.min(1, containerWidth / originalWidth, containerHeight / originalHeight)
  const displayedWidthInPixels = originalWidth * fittedScale * scale * devicePixelRatio
  const displayedHeightInPixels = originalHeight * fittedScale * scale * devicePixelRatio
  return displayedWidthInPixels >= previewWidth * UpgradeThreshold || displayedHeightInPixels >= previewHeight * UpgradeThreshold
}
