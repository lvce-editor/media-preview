import type { Test } from '@lvce-editor/test-with-playwright'

const tallSvg = `<svg width="100" height="1000" viewBox="0 0 100 1000" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="1000" fill="red" />
</svg>`

export const name = 'media-preview-tall-image-fit'

export const test: Test = async ({ expect, FileSystem, Locator, Main }) => {
  const tmpDir = await FileSystem.getTmpDir()
  const uri = `${tmpDir}/tall.svg`
  await FileSystem.setFiles([{ content: tallSvg, uri }])
  await Main.openUri(uri)

  const image = Locator('.MediaPreviewImage')
  await expect(image).toHaveJSProperty('naturalWidth', 100)
  await expect(image).toHaveJSProperty('naturalHeight', 1000)
  await expect(image).toHaveJSProperty('offsetWidth', 64)
  await expect(image).toHaveJSProperty('offsetHeight', 642)
}
