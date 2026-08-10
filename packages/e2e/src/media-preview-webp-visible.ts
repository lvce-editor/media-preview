import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-webp-visible'

export const test: Test = async ({ expect, Locator, Main }) => {
  const uri = import.meta.resolve('../files/sample.webp')
  await Main.openUri(uri)

  const image = Locator('.MediaPreviewImage')
  await expect(image).toBeVisible()
}
