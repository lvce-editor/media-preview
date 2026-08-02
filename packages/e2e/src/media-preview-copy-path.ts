import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-copy-path'

export const test: Test = async ({ ClipBoard, ContextMenu, expect, FileSystem, Locator, Main, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  const imageUri = `${tmpDir}/copy-path.svg`
  await FileSystem.writeFile(
    imageUri,
    '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="red"/></svg>',
  )
  await Workspace.setPath(tmpDir)
  await Main.openUri(imageUri)

  await ClipBoard.enableMemoryClipBoard()
  try {
    const image = Locator('.MediaPreviewImage')
    await expect(image).toBeVisible()
    // eslint-disable-next-line e2e/no-direct-click -- Right-click is the behavior under test and media preview has no page object yet.
    await image.click({ button: 'right' })

    await ContextMenu.selectItem('Copy Path')

    await ClipBoard.shouldHaveText(imageUri)
  } finally {
    await ClipBoard.disableMemoryClipBoard()
  }
}
