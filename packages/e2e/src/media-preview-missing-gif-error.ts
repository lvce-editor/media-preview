import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-missing-gif-error'

export const test: Test = async ({ expect, FileSystem, Locator, Main }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await Main.openUri(tmpDir + '/missing.gif')

  const error = Locator('.MediaPreviewError')
  const image = Locator('.MediaPreviewImage')
  await expect(error).toHaveText('Image could not be found')
  await expect(image).toHaveCount(0)
}
