import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-layout'

export const test: Test = async ({ expect, Locator, Main }) => {
  await Main.openUri(import.meta.resolve('../files/file.png'))

  const preview = Locator('.MediaPreview')
  const content = Locator('.MediaPreviewContent')
  await expect(preview).toHaveCSS('overflow', 'hidden')
  await expect(preview).toHaveCSS('touch-action', 'none')
  await expect(content).toHaveCSS('display', 'flex')
  await expect(content).toHaveCSS('align-items', 'center')
  await expect(content).toHaveCSS('justify-content', 'center')
}
