import type { Test } from '@lvce-editor/test-with-playwright'

const getSvg = (width: number): string => {
  return `<svg width="${width}" height="100" viewBox="0 0 ${width} 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="100" fill="red" />
</svg>`
}

export const name = 'media-preview-keyboard-navigation'

const waitForExpectation = async (assertion: () => Promise<void>): Promise<void> => {
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      await assertion()
      return
    } catch {
      // eslint-disable-next-line e2e/no-timeouts -- The test framework has no observable wait for status bar updates.
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  }
  await assertion()
}

export const test: Test = async ({ Command, expect, FileSystem, KeyBoard, Locator, Main, Settings }) => {
  await Settings.update({ 'statusBar.itemsVisible': true })
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.setFiles([
    { content: getSvg(100), uri: `${tmpDir}/image1.svg` },
    { content: getSvg(200), uri: `${tmpDir}/image2.svg` },
    { content: getSvg(300), uri: `${tmpDir}/image10.svg` },
    { content: 'not an image', uri: `${tmpDir}/notes.txt` },
  ])
  await Main.openUri(`${tmpDir}/image2.svg`)
  const preview = Locator('.MediaPreview')
  const image = Locator('.MediaPreviewImage')
  const dimensions = Locator('.StatusBarItem[name="media-preview-dimensions"]')
  const states = await Command.execute('Viewlet.getAllStates')
  const mediaPreview = Object.values(states).find(({ viewId }: any) => viewId === 'builtin.media-preview') as any
  await Command.execute('Viewlet.focusSelector', mediaPreview.uid, '.MediaPreview')
  await expect(preview).toBeFocused()
  await expect(image).toHaveJSProperty('naturalWidth', 200)
  await waitForExpectation(() => expect(dimensions).toHaveText('200 × 100'))

  await KeyBoard.press('ArrowRight')
  await waitForExpectation(() => expect(dimensions).toHaveText('300 × 100'))

  await KeyBoard.press('ArrowRight')
  await expect(dimensions).toHaveText('300 × 100')

  await KeyBoard.press('ArrowLeft')
  await waitForExpectation(() => expect(dimensions).toHaveText('200 × 100'))

  await KeyBoard.press('ArrowLeft')
  await waitForExpectation(() => expect(dimensions).toHaveText('100 × 100'))

  await KeyBoard.press('ArrowLeft')
  await expect(dimensions).toHaveText('100 × 100')
}
