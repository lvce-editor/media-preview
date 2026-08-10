import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-root-containment'

export const test: Test = async ({ expect, Locator, Main }) => {
  const uri = import.meta.resolve('../files/file.png')
  await Main.openUri(uri)

  const preview = Locator('.MediaPreview')
  await expect(preview).toHaveCSS('contain', 'strict')
  await expect(preview).toHaveCSS('margin', '0px')
}
