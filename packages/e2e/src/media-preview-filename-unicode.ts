import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-filename-unicode'

export const test: Test = async ({ expect, FileSystem, Locator, Main }) => {
  const tmpDir = await FileSystem.getTmpDir()
  const uri = tmpDir + '/green-image-東京.svg'
  await FileSystem.writeFile(
    uri,
    '<svg width="8" height="8" xmlns="http://www.w3.org/2000/svg"><rect width="8" height="8"/></svg>',
  )
  await Main.openUri(uri)

  const image = Locator('.MediaPreviewImage')
  const error = Locator('.MediaPreviewError')
  await expect(image).toBeVisible()
  await expect(error).toHaveCount(0)
}
