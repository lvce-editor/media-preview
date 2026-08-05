import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-invalid-svg-error'

export const test: Test = async ({ expect, FileSystem, Locator, Main }) => {
  const tmpDir = await FileSystem.getTmpDir()
  const uri = `${tmpDir}/invalid.svg`
  await FileSystem.writeFile(uri, '<svg>')
  await Main.openUri(uri)

  const error = Locator('.MediaPreviewError')
  await expect(error).toBeVisible()
  await expect(error).toHaveText('Image could not be loaded')
}
