import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-dragging-class-lifecycle'

export const test: Test = async ({ Command, expect, Locator, Main }) => {
  await Main.openUri(import.meta.resolve('../files/file.png'))

  const preview = Locator('.MediaPreview')
  const states = await Command.execute('Viewlet.getAllStates')
  const mediaPreview = Object.values(states).find(({ viewId }: any) => viewId === 'builtin.media-preview') as any
  await Command.execute('Viewlet.executeViewletCommand', mediaPreview.uid, 'handleMediaPreviewPointerDown', 0, 10, 10)
  await expect(preview).toHaveClass('MediaPreview MediaPreviewDragging')

  await Command.execute('Viewlet.executeViewletCommand', mediaPreview.uid, 'handleMediaPreviewPointerUp', 20, 20)
  await expect(preview).toHaveClass('MediaPreview')
}
