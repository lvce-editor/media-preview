import { expect, test } from '@jest/globals'
import { getCss } from '../src/parts/GetCss/GetCss.ts'

test('returns the media preview transform as dynamic css', () => {
  expect(getCss('matrix(1, 0, 0, 1, 10, 20)')).toBe(`.MediaPreview {
  --MediaPreviewTransform: matrix(1, 0, 0, 1, 10, 20);
}`)
})
