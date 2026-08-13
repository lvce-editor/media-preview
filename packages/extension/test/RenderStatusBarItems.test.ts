import { expect, test } from '@jest/globals'
import { renderStatusBarItems } from '../src/parts/RenderStatusBarItems/RenderStatusBarItems.ts'

test('renders image metadata as two status bar items', () => {
  expect(
    renderStatusBarItems({
      canOpenAsText: false,
      domMatrixString: '',
      error: false,
      errorMessage: '',
      fileSize: 873,
      height: 480,
      isFullResolution: true,
      pointerDown: false,
      scale: 1,
      sourceHeight: 480,
      sourceWidth: 640,
      url: '',
      width: 640,
    }),
  ).toEqual([
    {
      ariaLabel: 'Image dimensions: 640 by 480 pixels',
      name: 'media-preview-dimensions',
      text: '640 × 480',
      title: 'Image dimensions',
    },
    {
      ariaLabel: 'Image size: 873 B',
      name: 'media-preview-size',
      text: '873 B',
      title: 'Image size',
    },
  ])
})
