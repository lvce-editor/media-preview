import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-svg-coordinate-system-only-visible'

export const test: Test = async ({ expect, FileSystem, Locator, Main }) => {
  const tmpDir = await FileSystem.getTmpDir()
  const uri = tmpDir + '/coordinate-system-only.svg'
  await FileSystem.writeFile(
    uri,
    '<svg viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg"><rect width="8" height="8" fill="red"/></svg>',
  )
  await Main.openUri(uri)

  const image = Locator('.MediaPreviewImage')
  const error = Locator('.MediaPreviewError')
  await expect(image).toBeVisible()
  await expect(error).toHaveCount(0)
}
