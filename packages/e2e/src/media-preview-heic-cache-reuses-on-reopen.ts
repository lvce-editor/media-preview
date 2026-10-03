import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-heic-cache-reuses-on-reopen'

export const test: Test = async ({ expect, Locator, Main }) => {
  const uri = import.meta.resolve('../files/green.heic')
  const image = Locator('.MediaPreviewImage')
  const error = Locator('.MediaPreviewError')

  await Main.openUri(uri)
  await expect(image).toBeVisible()
  await Main.closeAllEditors()
  await Main.openUri(uri)
  await expect(image).toBeVisible()
  await expect(error).toHaveCount(0)
}
