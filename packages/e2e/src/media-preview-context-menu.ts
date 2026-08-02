import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-context-menu'

export const test: Test = async ({ expect, Locator, Main }) => {
  const imageUri = import.meta.resolve('../files/file.png')
  await Main.openUri(imageUri)

  const image = Locator('.MediaPreviewImage')
  const preview = Locator('.MediaPreview')
  await expect(image).toHaveCount(1)

  await image.dispatchEvent('pointerdown', { bubbles: true, button: 2, clientX: 10, clientY: 10, pointerId: 1 } as any)
  await expect(preview).toHaveClass('MediaPreview')

  await image.dispatchEvent('contextmenu', { bubbles: true, button: 2, clientX: 10, clientY: 10 } as any)

  const menuItems = Locator('.MenuItem')
  const copyPath = menuItems.nth(0)
  const copyImage = menuItems.nth(1)
  let lastError: unknown
  for (let i = 0; i < 20; i++) {
    try {
      await expect(copyPath).toBeVisible()
      lastError = undefined
      break
    } catch (error) {
      lastError = error
      await new Promise((resolve) => globalThis.setTimeout(resolve, 50))
    }
  }
  if (lastError) {
    throw lastError
  }
  await expect(menuItems).toHaveCount(2)
  await expect(copyPath).toHaveText('Copy Path')
  await expect(copyImage).toHaveText('Copy Image')
}
