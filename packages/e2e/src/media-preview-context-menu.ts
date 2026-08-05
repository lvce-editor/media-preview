import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-context-menu'

export const test: Test = async ({ Command, expect, Locator, Main }) => {
  const imageUri = import.meta.resolve('../files/file.png')
  await Main.openUri(imageUri)

  const image = Locator('.MediaPreviewImage')
  const preview = Locator('.MediaPreview')
  await expect(image).toHaveCount(1)

  await image.dispatchEvent('pointerdown', { bubbles: true, button: 2, clientX: 10, clientY: 10, pointerId: 1 } as any)
  await expect(preview).toHaveClass('MediaPreview')

  const states = await Command.execute('Viewlet.getAllStates')
  const mediaPreview = Object.values(states).find(({ viewId }: any) => viewId === 'builtin.media-preview') as any
  await Command.execute('Viewlet.executeViewletCommand', mediaPreview.uid, 'handleContextMenu', 'image', 10, 10)

  const menuItems = Locator('.MenuItem')
  const copyPath = menuItems.nth(0)
  const copyImage = menuItems.nth(1)
  await expect(menuItems).toHaveCount(2)
  await expect(copyPath).toHaveText('Copy Path')
  await expect(copyImage).toHaveText('Copy Image')
}
