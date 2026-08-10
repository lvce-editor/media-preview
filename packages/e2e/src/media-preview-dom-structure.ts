import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-dom-structure'

export const test: Test = async ({ expect, Locator, Main }) => {
  const uri = import.meta.resolve('../files/file.png')
  await Main.openUri(uri)

  const preview = Locator('.MediaPreview')
  const content = preview.locator('.MediaPreviewContent')
  const wrapper = content.locator('.MediaPreviewImageWrapper')
  const image = wrapper.locator('.MediaPreviewImage')
  await expect(preview).toHaveCount(1)
  await expect(content).toHaveCount(1)
  await expect(wrapper).toHaveCount(1)
  await expect(image).toHaveCount(1)
}
