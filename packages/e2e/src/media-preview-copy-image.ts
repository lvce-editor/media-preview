import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-copy-image'

export const test: Test = async ({ Command, expect, Locator, Main }) => {
  const imageUri = import.meta.resolve('../files/file.png')
  await Main.openUri(imageUri)

  const image = Locator('.MediaPreviewImage')
  await expect(image).toHaveCount(1)
  const states = await Command.execute('Viewlet.getAllStates')
  const mediaPreview = Object.values(states).find(({ viewId }: any) => viewId === 'builtin.media-preview') as any
  await Command.execute('Viewlet.executeViewletCommand', mediaPreview.uid, 'handleContextMenu', 'image', 10, 10)
  const copyImage = Locator('.MenuItem').nth(1)
  await expect(copyImage).toHaveText('Copy Image')
  // eslint-disable-next-line e2e/no-direct-click -- Image clipboard writes require a trusted user gesture.
  await copyImage.click()
}
