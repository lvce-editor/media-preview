import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-wrapper-containment'

export const test: Test = async ({ expect, Locator, Main }) => {
  const uri = import.meta.resolve('../files/file.png')
  await Main.openUri(uri)

  const wrapper = Locator('.MediaPreviewImageWrapper')
  await expect(wrapper).toHaveCSS('contain', 'content')
}
