import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-copy-path'

export const test: Test = async ({ ClipBoard, ContextMenu, expect, Locator, Main }) => {
  const imageUri = import.meta.resolve('../files/file.png')
  await Main.openUri(imageUri)

  await ClipBoard.enableMemoryClipBoard()
  try {
    const image = Locator('.MediaPreviewImage')
    await expect(image).toHaveCount(1)
    await image.dispatchEvent('contextmenu', { bubbles: true, button: 2, clientX: 10, clientY: 10 } as any)
    const firstMenuItem = Locator('.MenuItem').nth(0)
    let lastError: unknown
    for (let i = 0; i < 20; i++) {
      try {
        await expect(firstMenuItem).toBeVisible()
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

    await ContextMenu.selectItem('Copy Path')

    await ClipBoard.shouldHaveText(imageUri)
  } finally {
    await ClipBoard.disableMemoryClipBoard()
  }
}
