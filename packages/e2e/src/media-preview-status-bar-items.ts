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
  const firstUri = import.meta.resolve('../files/file.png')
  const secondUri = import.meta.resolve('../files/sample.jpg')
  await Main.openUris([firstUri, secondUri])

  const dimensions = Locator('.StatusBarItem[name="media-preview-dimensions"]')
  const size = Locator('.StatusBarItem[name="media-preview-size"]')
  const tabs = Locator('.MainTab')
  await waitForExpectation(() => expect(tabs).toHaveCount(2))
  await waitForExpectation(() => expect(dimensions).toHaveCount(1))
  await waitForExpectation(() => expect(size).toHaveCount(1))
  await waitForExpectation(() => expect(dimensions).toBeVisible())
  await waitForExpectation(() => expect(size).toBeVisible())
  await waitForExpectation(() => expect(size).toHaveText('100 kB'))

  await Main.selectTab(0, 0)

  await waitForExpectation(() => expect(dimensions).toHaveCount(1))
  await waitForExpectation(() => expect(size).toHaveCount(1))
  await waitForExpectation(() => expect(dimensions).toHaveText('256 × 256'))
  await waitForExpectation(() => expect(size).toHaveText('873 B'))

  await Main.closeAllEditors()
  await waitForExpectation(() => expect(dimensions).toBeHidden())
  await waitForExpectation(() => expect(size).toBeHidden())
}
