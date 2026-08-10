import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-tif-visible'

export const test: Test = async ({ expect, Locator, Main }) => {
  const uri = import.meta.resolve('../files/sample.tif')
  await Main.openUri(uri)

  const image = Locator('.MediaPreviewImage')
  const error = Locator('.MediaPreviewError')
  await expect(image).toBeVisible()
  await expect(error).toHaveCount(0)
}
