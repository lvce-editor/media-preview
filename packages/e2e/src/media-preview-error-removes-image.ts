import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-error-removes-image'

export const test: Test = async ({ expect, FileSystem, Locator, Main }) => {
  const tmpDir = await FileSystem.getTmpDir()
  const uri = `${tmpDir}/invalid.png`
  await FileSystem.writeFile(uri, 'not an image')
  await Main.openUri(uri)

  const error = Locator('.MediaPreviewError')
  const image = Locator('.MediaPreviewImage')
  const content = Locator('.MediaPreviewContent')
  await expect(error).toBeVisible()
  await expect(image).toHaveCount(0)
  await expect(content).toHaveCount(0)
}
