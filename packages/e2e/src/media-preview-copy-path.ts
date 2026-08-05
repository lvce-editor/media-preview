import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-copy-path'

export const test: Test = async ({ ClipBoard, Command, ContextMenu, expect, Locator, Main }) => {
  const imageUri = import.meta.resolve('../files/file.png')
  await Main.openUri(imageUri)

  await ClipBoard.enableMemoryClipBoard()
  try {
    const image = Locator('.MediaPreviewImage')
    await expect(image).toHaveCount(1)
    const states = await Command.execute('Viewlet.getAllStates')
    const mediaPreview = Object.values(states).find(({ viewId }: any) => viewId === 'builtin.media-preview') as any
    await Command.execute('Viewlet.executeViewletCommand', mediaPreview.uid, 'handleContextMenu', 'image', 10, 10)
    await ContextMenu.selectItem('Copy Path')

    await ClipBoard.shouldHaveText(imageUri)
  } finally {
    await ClipBoard.disableMemoryClipBoard()
  }
}
