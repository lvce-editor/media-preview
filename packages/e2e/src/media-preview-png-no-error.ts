import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-png-no-error'

export const test: Test = async ({ expect, Locator, Main }) => {
  const uri = import.meta.resolve('../files/file.png')
  await Main.openUri(uri)

  const error = Locator('.MediaPreviewError')
  await expect(error).toHaveCount(0)
}
