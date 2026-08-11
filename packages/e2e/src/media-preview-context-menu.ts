import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-context-menu'

export const test: Test = async ({ Command, ContextMenu, expect, Locator, Main }) => {
  const imageUri = import.meta.resolve('../files/file.png')
  await Main.openUri(imageUri)

  const image = Locator('.MediaPreviewImage')
  await expect(image).toHaveCount(1)

  const states = await Command.execute('Viewlet.getAllStates')
  const mediaPreview = Object.values(states).find(({ viewId }: any) => viewId === 'builtin.media-preview') as any
  await Command.execute(
    'Viewlet.executeViewletCommand',
    mediaPreview.uid,
    'handleViewCommand',
    'handleMediaPreviewWheel',
    -100,
    0,
  )
  await Command.execute(
    'Viewlet.executeViewletCommand',
    mediaPreview.uid,
    'handleViewCommand',
    'handleMediaPreviewPointerDown',
    0,
    0,
    0,
  )
  await Command.execute(
    'Viewlet.executeViewletCommand',
    mediaPreview.uid,
    'handleViewCommand',
    'handleMediaPreviewPointerMove',
    10,
    20,
  )
  await Command.execute(
    'Viewlet.executeViewletCommand',
    mediaPreview.uid,
    'handleViewCommand',
    'handleMediaPreviewPointerUp',
    10,
    20,
  )
  const content = Locator('.MediaPreviewContent')
  await expect(content).not.toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
  await Command.execute('Viewlet.executeViewletCommand', mediaPreview.uid, 'handleContextMenu', 'image', 10, 10)

  const menuItems = Locator('.MenuItem')
  const copyPath = menuItems.nth(0)
  const copyImage = menuItems.nth(1)
  const resetImage = menuItems.nth(2)
  await expect(menuItems).toHaveCount(3)
  await expect(copyPath).toHaveText('Copy Path')
  await expect(copyImage).toHaveText('Copy Image')
  await expect(resetImage).toHaveText('Reset Image')

  await ContextMenu.selectItem('Reset Image')

  await expect(content).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
}
