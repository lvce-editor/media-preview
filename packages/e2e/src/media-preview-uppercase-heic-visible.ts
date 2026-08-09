import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-uppercase-heic-visible'

export const test: Test = async ({ expect, Locator, Main }) => {
  await Main.openUri(import.meta.resolve('../files/green.HEIC'))

  const image = Locator('.MediaPreviewImage')
  const error = Locator('.MediaPreviewError')
  await expect(image).toBeVisible()
  await expect(error).toHaveCount(0)
}
