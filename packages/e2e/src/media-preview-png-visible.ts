import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-png-visible'

export const test: Test = async ({ expect, Locator, Main }) => {
  await Main.openUri(import.meta.resolve('../files/file.png'))

  const image = Locator('.MediaPreviewImage')
  await expect(image).toBeVisible()
}
