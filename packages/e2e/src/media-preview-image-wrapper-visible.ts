import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-image-wrapper-visible'

export const test: Test = async ({ expect, Locator, Main }) => {
  await Main.openUri(import.meta.resolve('../files/file.png'))

  const wrapper = Locator('.MediaPreviewImageWrapper')
  await expect(wrapper).toBeVisible()
}
