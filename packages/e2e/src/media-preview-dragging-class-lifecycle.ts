import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-dragging-class-lifecycle'

export const test: Test = async ({ expect, Locator, Main }) => {
  await Main.openUri(import.meta.resolve('../files/file.png'))

  const preview = Locator('.MediaPreview')
  await preview.dispatchEvent('pointerdown', {
    bubbles: true,
    button: 0,
    clientX: 10,
    clientY: 10,
    pointerId: 1,
  } as any)
  await expect(preview).toHaveClass('MediaPreview MediaPreviewDragging')

  await preview.dispatchEvent('pointerup', {
    bubbles: true,
    button: 0,
    clientX: 20,
    clientY: 20,
    pointerId: 1,
  } as any)
  await expect(preview).toHaveClass('MediaPreview')
}
