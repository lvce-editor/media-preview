import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-jpg-image-attributes'

export const test: Test = async ({ expect, Locator, Main }) => {
  const uri = import.meta.resolve('../files/sample.jpg')
  await Main.openUri(uri)

  const image = Locator('.MediaPreviewImage')
  await expect(image).toHaveAttribute('alt', '')
  await expect(image).toHaveAttribute('draggable', 'false')
}
