import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-status-bar-items'

const waitForExpectation = async (assertion: () => Promise<void>): Promise<void> => {
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      await assertion()
      return
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  }
  await assertion()
}

export const test: Test = async ({ expect, Locator, Main, Settings }) => {
  await Settings.update({ 'statusBar.itemsVisible': true })
  const uri = import.meta.resolve('../files/file.png')
  await Main.openUri(uri)

  const dimensions = Locator('.StatusBarItem[name="media-preview-dimensions"]')
  const size = Locator('.StatusBarItem[name="media-preview-size"]')
  await expect(dimensions).toBeVisible()
  await waitForExpectation(() => expect(dimensions).toHaveText('256 × 256'))
  await expect(size).toBeVisible()
  await expect(size).toHaveText('873 B')

  await Main.closeAllEditors()
  await waitForExpectation(() => expect(dimensions).toBeHidden())
  await waitForExpectation(() => expect(size).toBeHidden())
}
