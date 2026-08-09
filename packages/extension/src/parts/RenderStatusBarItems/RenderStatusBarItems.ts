import type { StatusBarItem } from '@lvce-editor/api'
import type { MediaPreviewState } from '../MediaPreviewViewInstance/MediaPreviewViewInstance.ts'
import { formatBytes } from '../FormatBytes/FormatBytes.ts'

export const renderStatusBarItems = (state: Readonly<MediaPreviewState>): readonly StatusBarItem[] => {
  const { fileSize, height, width } = state
  const dimensions = width > 0 && height > 0 ? `${width} × ${height}` : '— × —'
  const size = formatBytes(fileSize)
  return [
    {
      ariaLabel: width > 0 && height > 0 ? `Image dimensions: ${width} by ${height} pixels` : 'Image dimensions unavailable',
      name: 'media-preview-dimensions',
      text: dimensions,
      title: 'Image dimensions',
    },
    {
      ariaLabel: `Image size: ${size}`,
      name: 'media-preview-size',
      text: size,
      title: 'Image size',
    },
  ]
}
