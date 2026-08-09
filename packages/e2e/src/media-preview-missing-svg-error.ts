import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-missing-svg-error'

export const test: Test = async ({ expect, FileSystem, Locator, Main }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await Main.openUri(tmpDir + '/missing.svg')

  const error = Locator('.MediaPreviewError')
  const image = Locator('.MediaPreviewImage')
  const openInTextEditor = Locator('.MediaPreviewOpenInTextEditor')
  await expect(error).toHaveText('Image could not be found')
  await expect(image).toHaveCount(0)
  await expect(openInTextEditor).toHaveCount(0)
}
