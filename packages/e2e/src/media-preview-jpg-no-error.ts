import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-jpg-no-error'

export const test: Test = async ({ expect, Locator, Main }) => {
  await Main.openUri(import.meta.resolve('../files/sample.jpg'))

  const error = Locator('.MediaPreviewError')
  await expect(error).toHaveCount(0)
}
