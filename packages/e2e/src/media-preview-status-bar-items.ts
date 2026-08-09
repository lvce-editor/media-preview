import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-status-bar-items'

// The e2e editor currently starts without extension status bar items enabled.
export const skip = true

export const test: Test = async ({ expect, Locator, Main, Settings }) => {
  await Settings.update({ 'statusBar.itemsVisible': true })
  await Main.openUri(import.meta.resolve('../files/file.png'))

  const dimensions = Locator('.StatusBarItem[name="media-preview-dimensions"]')
  const size = Locator('.StatusBarItem[name="media-preview-size"]')
  await expect(dimensions).toBeVisible()
  await expect(dimensions).toHaveText('1 × 1')
  await expect(size).toBeVisible()
  await expect(size).toHaveText('873 B')

  await Main.closeAllEditors()
  await expect(dimensions).toBeHidden()
  await expect(size).toBeHidden()
}
