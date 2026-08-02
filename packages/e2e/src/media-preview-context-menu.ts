import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-context-menu'

export const test: Test = async ({ expect, FileSystem, Locator, Main, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  const imageUri = `${tmpDir}/context-menu.svg`
  await FileSystem.writeFile(
    imageUri,
    '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="red"/></svg>',
  )
  await Workspace.setPath(tmpDir)
  await Main.openUri(imageUri)

  const image = Locator('.MediaPreviewImage')
  const preview = Locator('.MediaPreview')
  await expect(image).toBeVisible()

  await image.dispatchEvent('pointerdown', { bubbles: true, button: 2, clientX: 10, clientY: 10, pointerId: 1 } as any)
  await expect(preview).toHaveClass('MediaPreview')

  // eslint-disable-next-line e2e/no-direct-click -- Right-click is the behavior under test and media preview has no page object yet.
  await image.click({ button: 'right' })

  const menuItems = Locator('.MenuItem')
  const copyPath = menuItems.nth(0)
  const copyImage = menuItems.nth(1)
  await expect(menuItems).toHaveCount(2)
  await expect(copyPath).toHaveText('Copy Path')
  await expect(copyImage).toHaveText('Copy Image')
}
