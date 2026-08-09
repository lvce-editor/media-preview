import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-missing-file-error'

export const test: Test = async ({ expect, FileSystem, Locator, Main }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await Main.openUri(`${tmpDir}/missing.png`)

  const error = Locator('.MediaPreviewError')
  await expect(error).toBeVisible()
  await expect(error).toHaveText('Image could not be found')
}
