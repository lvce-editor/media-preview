import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-jpg-visible'

export const test: Test = async ({ expect, Locator, Main }) => {
  await Main.openUri(import.meta.resolve('../files/sample.jpg'))

  const image = Locator('.MediaPreviewImage')
  await expect(image).toBeVisible()
}
