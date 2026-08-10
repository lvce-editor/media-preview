import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-non-primary-pointer-does-not-drag'

export const test: Test = async ({ expect, Locator, Main }) => {
  const uri = import.meta.resolve('../files/file.png')
  await Main.openUri(uri)

  const preview = Locator('.MediaPreview')
  await preview.dispatchEvent('pointerdown', {
    bubbles: true,
    button: 1,
    clientX: 10,
    clientY: 10,
    pointerId: 1,
  } as any)

  await expect(preview).toHaveClass('MediaPreview')
}
