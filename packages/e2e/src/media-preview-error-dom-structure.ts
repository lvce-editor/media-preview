import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-error-dom-structure'

export const test: Test = async ({ expect, FileSystem, Locator, Main }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await Main.openUri(tmpDir + '/missing.avif')

  const error = Locator('.MediaPreviewError')
  const message = error.locator('span')
  const image = Locator('.MediaPreviewImage')
  await expect(error).toHaveCount(1)
  await expect(message).toHaveCount(1)
  await expect(message).toHaveText('Image could not be loaded')
  await expect(image).toHaveCount(0)
}
