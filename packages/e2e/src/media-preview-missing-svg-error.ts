import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-missing-svg-error'

export const test: Test = async ({ expect, FileSystem, Locator, Main }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await Main.openUri(tmpDir + '/missing.svg')

  const error = Locator('.MediaPreviewError')
  const errorMessage = Locator('.MediaPreviewErrorMessage')
  const image = Locator('.MediaPreviewImage')
  const openInTextEditor = Locator('.MediaPreviewOpenInTextEditor')
  await expect(error).toBeVisible()
  await expect(errorMessage).toHaveText('Image could not be loaded')
  await expect(openInTextEditor).toBeVisible()
  await expect(image).toHaveCount(0)
}
