import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-error-layout'

export const test: Test = async ({ expect, FileSystem, Locator, Main }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await Main.openUri(`${tmpDir}/missing.png`)

  const error = Locator('.MediaPreviewError')
  await expect(error).toHaveCSS('display', 'flex')
  await expect(error).toHaveCSS('align-items', 'center')
  await expect(error).toHaveCSS('justify-content', 'center')
}
