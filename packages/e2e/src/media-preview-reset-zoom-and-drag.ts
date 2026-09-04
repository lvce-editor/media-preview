import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-reset-zoom-and-drag'

const waitForExpectation = async (assertion: () => Promise<void>): Promise<void> => {
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      await assertion()
      return
    } catch {
      // eslint-disable-next-line e2e/no-timeouts -- The test framework has no observable wait for view updates.
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  }
  await assertion()
}

export const test: Test = async ({ Command, ContextMenu, expect, Locator, Main }) => {
  const imageUri = import.meta.resolve('../files/file.png')
  await Main.openUri(imageUri)
  const image = Locator('.MediaPreviewImage')
  await waitForExpectation(() => expect(image).toHaveJSProperty('naturalWidth', 256))
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
  await waitForExpectation(() => expect(content).toHaveCSS('transform', 'matrix(1.5, 0, 0, 1.5, 10, 20)'))
  await Command.execute('Viewlet.executeViewletCommand', mediaPreview.uid, 'handleContextMenu', 'image', 10, 10)
  await ContextMenu.selectItem('Reset Image')
  await waitForExpectation(() => expect(content).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)'))
}
