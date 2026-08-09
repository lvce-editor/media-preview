import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-svg-title-visible'

export const test: Test = async ({ expect, FileSystem, Locator, Main }) => {
  const tmpDir = await FileSystem.getTmpDir()
  const uri = tmpDir + '/with-title.svg'
  await FileSystem.writeFile(
    uri,
    '<svg width="8" height="8" xmlns="http://www.w3.org/2000/svg"><title>Preview fixture</title><path d="M0 0h8v8H0z" fill="green"/></svg>',
  )
  await Main.openUri(uri)

  const image = Locator('.MediaPreviewImage')
  const error = Locator('.MediaPreviewError')
  await expect(image).toBeVisible()
  await expect(error).toHaveCount(0)
}
