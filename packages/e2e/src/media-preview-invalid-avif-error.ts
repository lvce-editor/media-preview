import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-invalid-avif-error'

export const test: Test = async ({ expect, FileSystem, Locator, Main }) => {
  const tmpDir = await FileSystem.getTmpDir()
  const uri = tmpDir + '/invalid.avif'
  await FileSystem.writeFile(uri, 'not a valid avif image')
  await Main.openUri(uri)

  const error = Locator('.MediaPreviewError')
  const image = Locator('.MediaPreviewImage')
  await expect(error).toHaveText('Image could not be loaded')
  await expect(image).toHaveCount(0)
}
