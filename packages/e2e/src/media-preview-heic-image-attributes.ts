import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-heic-image-attributes'

export const test: Test = async ({ expect, Locator, Main }) => {
  const uri = import.meta.resolve('../files/green.heic')
  await Main.openUri(uri)

  const image = Locator('.MediaPreviewImage')
  await expect(image).toHaveAttribute('alt', '')
  await expect(image).toHaveAttribute('decoding', 'async')
  await expect(image).toHaveAttribute('draggable', 'false')
  await expect(image).toHaveAttribute('height', '1')
  await expect(image).toHaveAttribute('width', '1')
}
