import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-filename-space'

export const test: Test = async ({ expect, FileSystem, Locator, Main, Settings }) => {
  await Settings.update({ 'statusBar.itemsVisible': true })
  const tmpDir = await FileSystem.getTmpDir({ scheme: 'file' })
  const uri = tmpDir + '/image with space.svg'
  const content = '<svg width="8" height="8" xmlns="http://www.w3.org/2000/svg"><rect width="8" height="8"/></svg>'
  await FileSystem.writeFile(uri, content)
  await Main.openUri(uri)

  const image = Locator('.MediaPreviewImage')
  const error = Locator('.MediaPreviewError')
  const dimensions = Locator('.StatusBarItem[name="media-preview-dimensions"]')
  const size = Locator('.StatusBarItem[name="media-preview-size"]')
  await expect(image).toBeVisible()
  await expect(error).toHaveCount(0)
  await expect(dimensions).toHaveText('8 × 8')
  await expect(size).toHaveText(`${content.length} B`)
}
