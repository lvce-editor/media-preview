import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-reset-zoom-and-drag'

export const test: Test = async ({ Command, ContextMenu, expect, Locator, Main }) => {
  const imageUri = import.meta.resolve('../files/file.png')
  await Main.openUri(imageUri)
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
  await expect(content).toHaveCSS('transform', 'matrix(1.5, 0, 0, 1.5, 10, 20)')
  await Command.execute('Viewlet.executeViewletCommand', mediaPreview.uid, 'handleContextMenu', 'image', 10, 10)
  await ContextMenu.selectItem('Reset Image')
  await expect(content).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
}
