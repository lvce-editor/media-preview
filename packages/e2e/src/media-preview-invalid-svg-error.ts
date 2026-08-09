import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-invalid-svg-error'

export const test: Test = async ({ Editor, expect, FileSystem, Locator, Main }) => {
  const tmpDir = await FileSystem.getTmpDir()
  const uri = `${tmpDir}/invalid.svg`
  await FileSystem.writeFile(uri, '<svg>')
  await Main.openUri(uri)

  const error = Locator('.MediaPreviewError')
  await expect(error).toBeVisible()
  const errorMessage = Locator('.MediaPreviewErrorMessage')
  await expect(errorMessage).toHaveText('Image could not be loaded')

  const openInTextEditor = Locator('.MediaPreviewOpenInTextEditor')
  await expect(openInTextEditor).toBeVisible()
  await expect(openInTextEditor).toHaveText('Open in Text Editor')
  await openInTextEditor.click()

  await Editor.shouldHaveText('<svg>')
}
