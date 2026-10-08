import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.media-preview-drag'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Main, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(
    `${tmpDir}/drag-test.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"><rect width="1920" height="1080" fill="red"/><rect x="960" width="960" height="540" fill="blue"/><rect y="540" width="960" height="540" fill="green"/><rect x="960" y="540" width="960" height="540" fill="yellow"/></svg>`,
  )
  await Workspace.setUri(tmpDir)
  await Main.openUri(`${tmpDir}/drag-test.svg`)

  const preview = Locator('.MediaPreview')
  const content = Locator('.MediaPreviewContent')
  const imageWrapper = Locator('.MediaPreviewImageWrapper')
  await expect(preview).toBeVisible()
  await expect(Locator('.MediaPreviewImage')).toHaveJSProperty('naturalWidth', 1920)
  await expect(content).toHaveCSS('contain', 'none')
  await expect(imageWrapper).toHaveCSS('contain', 'none')

  await Command.execute('PointerCapture.mock')
  await preview.dispatchEvent('wheel', {
    bubbles: true,
    clientX: 0,
    clientY: 0,
    deltaX: 0,
    deltaY: -100,
  })
  await preview.dispatchEvent('pointerdown', {
    bubbles: true,
    button: 0,
    clientX: 100,
    clientY: 100,
  })
  await preview.dispatchEvent('pointermove', {
    bubbles: true,
    clientX: 130,
    clientY: 120,
  })
  await preview.dispatchEvent('pointerup', {
    bubbles: true,
    button: 0,
    clientX: 130,
    clientY: 120,
  })

  await expect(content).toHaveCSS('transform', 'matrix(1.5, 0, 0, 1.5, 30, 20)')
  await expect(preview).toHaveCSS('cursor', 'auto')
  const states = await Command.execute('Viewlet.getAllStates')
  const mediaPreview = Object.values(states).find(({ viewId }: any) => viewId === 'builtin.media-preview') as any
  await Command.execute('Viewlet.executeViewletCommand', mediaPreview.uid, 'handleViewCommand', 'handleResetImage')
  await expect(content).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
  await Command.execute('PointerCapture.unmock')
}
