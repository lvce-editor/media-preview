import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-jpe-visible'

export const test: Test = async ({ expect, Locator, Main }) => {
  const uri = import.meta.resolve('../files/sample.jpe')
  await Main.openUri(uri)

  const image = Locator('.MediaPreviewImage')
  const error = Locator('.MediaPreviewError')
  await expect(image).toBeVisible()
  await expect(error).toHaveCount(0)
}
