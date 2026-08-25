import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-missing-absolute-path-error'

const toAbsolutePath = (fileUri: string): string => {
  return /^file:\/\/\/[a-z]:/i.test(fileUri) ? fileUri.slice('file:///'.length) : fileUri.slice('file://'.length)
}

export const test: Test = async ({ expect, FileSystem, Locator, Main }) => {
  const tmpDir = await FileSystem.getTmpDir({ scheme: 'file' })
  await Main.openUri(`${toAbsolutePath(tmpDir)}/missing.svg`)

  const error = Locator('.MediaPreviewError')
  const openInTextEditor = Locator('.MediaPreviewOpenInTextEditor')
  await expect(error).toBeVisible()
  await expect(error).toHaveText('Image could not be found')
  await expect(openInTextEditor).toHaveCount(0)
}
