import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-nested-special-path'

export const test: Test = async ({ expect, FileSystem, Locator, Main }) => {
  const tmpDir = await FileSystem.getTmpDir()
  const parent = tmpDir + '/nested folder'
  const child = parent + '/深い'
  const uri = child + '/final image.svg'
  await FileSystem.mkdir(parent)
  await FileSystem.mkdir(child)
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
