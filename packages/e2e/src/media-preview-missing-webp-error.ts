import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-missing-webp-error'

export const test: Test = async ({ expect, FileSystem, Locator, Main }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await Main.openUri(tmpDir + '/missing.webp')

  const error = Locator('.MediaPreviewError')
  const image = Locator('.MediaPreviewImage')
  await expect(error).toHaveText('Image could not be loaded')
  await expect(image).toHaveCount(0)
}
