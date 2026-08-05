import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-image-fit'

export const test: Test = async ({ expect, Locator, Main }) => {
  await Main.openUri(import.meta.resolve('../files/file.png'))

  const image = Locator('.MediaPreviewImage')
  await expect(image).toHaveCSS('max-width', '100%')
  await expect(image).toHaveCSS('max-height', '100%')
  await expect(image).toHaveCSS('user-select', 'none')
}
