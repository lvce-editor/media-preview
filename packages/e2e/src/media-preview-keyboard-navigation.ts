import type { Test } from '@lvce-editor/test-with-playwright'

const getSvg = (width: number): string => {
  return `<svg width="${width}" height="100" viewBox="0 0 ${width} 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="100" fill="red" />
</svg>`
}

export const name = 'media-preview-keyboard-navigation'

export const test: Test = async ({ expect, FileSystem, KeyBoard, Locator, Main }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.setFiles([
    { content: getSvg(100), uri: `${tmpDir}/image1.svg` },
    { content: getSvg(200), uri: `${tmpDir}/image2.svg` },
    { content: getSvg(300), uri: `${tmpDir}/image10.svg` },
    { content: 'not an image', uri: `${tmpDir}/notes.txt` },
  ])
  await Main.openUri(`${tmpDir}/image2.svg`)
  const image = Locator('.MediaPreviewImage')
  await expect(image).toHaveJSProperty('naturalWidth', 200)

  await KeyBoard.press('ArrowRight')
  await expect(image).toHaveJSProperty('naturalWidth', 300)

  await KeyBoard.press('ArrowRight')
  await expect(image).toHaveJSProperty('naturalWidth', 300)

  await KeyBoard.press('ArrowLeft')
  await expect(image).toHaveJSProperty('naturalWidth', 200)

  await KeyBoard.press('ArrowLeft')
  await expect(image).toHaveJSProperty('naturalWidth', 100)

  await KeyBoard.press('ArrowLeft')
  await expect(image).toHaveJSProperty('naturalWidth', 100)
}
