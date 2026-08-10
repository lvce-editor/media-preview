import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-content-containment'

export const test: Test = async ({ expect, Locator, Main }) => {
  const uri = import.meta.resolve('../files/file.png')
  await Main.openUri(uri)

  const content = Locator('.MediaPreviewContent')
  await expect(content).toHaveCSS('contain', 'strict')
}
