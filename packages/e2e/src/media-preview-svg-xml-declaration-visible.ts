import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-svg-xml-declaration-visible'

export const test: Test = async ({ expect, FileSystem, Locator, Main }) => {
  const tmpDir = await FileSystem.getTmpDir()
  const uri = tmpDir + '/xml-declaration.svg'
  await FileSystem.writeFile(
    uri,
    '<?xml version="1.0" encoding="UTF-8"?><svg width="8" height="8" xmlns="http://www.w3.org/2000/svg"><circle cx="4" cy="4" r="4" fill="blue"/></svg>',
  )
  await Main.openUri(uri)

  const image = Locator('.MediaPreviewImage')
  const error = Locator('.MediaPreviewError')
  await expect(image).toBeVisible()
  await expect(error).toHaveCount(0)
}
