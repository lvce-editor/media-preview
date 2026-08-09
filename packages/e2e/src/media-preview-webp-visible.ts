import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-webp-visible'

export const test: Test = async ({ expect, Locator, Main }) => {
  await Main.openUri(import.meta.resolve('../files/sample.webp'))

  const image = Locator('.MediaPreviewImage')
  await expect(image).toBeVisible()
}
