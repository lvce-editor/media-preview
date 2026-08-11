import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-focused-on-open'

// Requires renderer-process support for focusing extension view roots.
export const skip = true

export const test: Test = async ({ expect, Locator, Main }) => {
  const uri = import.meta.resolve('../files/file.png')
  await Main.openUri(uri)

  const preview = Locator('.MediaPreview')
  await expect(preview).toBeFocused()
}
