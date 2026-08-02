import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-copy-image'

export const test: Test = async ({ ContextMenu, expect, Locator, Main }) => {
  const imageUri = import.meta.resolve('../files/file.png')
  await Main.openUri(imageUri)

  const image = Locator('.MediaPreviewImage')
  await expect(image).toBeVisible()
  // eslint-disable-next-line e2e/no-direct-click -- Right-click is the behavior under test and media preview has no page object yet.
  await image.click({ button: 'right' })

  await ContextMenu.selectItem('Copy Image')

  const menuItems = Locator('.MenuItem')
  await expect(menuItems).toHaveCount(0)
}
