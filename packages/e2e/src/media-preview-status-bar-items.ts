import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-status-bar-items'

export const test: Test = async ({ expect, Locator, Main, Settings }) => {
  await Settings.update({ 'statusBar.itemsVisible': true })
  const firstUri = import.meta.resolve('../files/file.png')
  const secondUri = import.meta.resolve('../files/sample.jpg')
  await Main.openUris([firstUri, secondUri])

  const dimensions = Locator('.StatusBarItem[name="media-preview-dimensions"]')
  const size = Locator('.StatusBarItem[name="media-preview-size"]')
  const tabs = Locator('.MainTab')
  await expect(tabs).toHaveCount(2)
  await expect(dimensions).toHaveCount(1)
  await expect(size).toHaveCount(1)
  await expect(dimensions).toBeVisible()
  await expect(size).toBeVisible()
  await expect(size).toHaveText('100 kB')

  await Main.selectTab(0, 0)

  await expect(dimensions).toHaveCount(1)
  await expect(size).toHaveCount(1)
  await expect(dimensions).toHaveText('256 × 256')
  await expect(size).toHaveText('873 B')

  await Main.closeAllEditors()
  await expect(dimensions).toBeHidden()
  await expect(size).toBeHidden()
}
