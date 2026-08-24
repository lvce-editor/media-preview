import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-missing-absolute-path-error'

export const test: Test = async ({ expect, Locator, Main }) => {
  await Main.openUri('/__lvce_media_preview_missing__.svg')

  const error = Locator('.MediaPreviewError')
  const openInTextEditor = Locator('.MediaPreviewOpenInTextEditor')
  await expect(error).toBeVisible()
  await expect(error).toHaveText('Image could not be found')
  await expect(openInTextEditor).toHaveCount(0)
}
