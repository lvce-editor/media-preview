import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-context-menu'

export const test: Test = async ({ Command, expect, Locator, Main }) => {
  const imageUri = import.meta.resolve('../files/file.png')
  await Main.openUri(imageUri)

  const image = Locator('.MediaPreviewImage')
  const preview = Locator('.MediaPreview')
  await expect(image).toHaveCount(1)

  await image.dispatchEvent('pointerdown', { bubbles: true, button: 2, clientX: 10, clientY: 10, pointerId: 1 } as any)
  await expect(preview).toHaveClass('MediaPreview')

  const savedState: any = await Main.saveState(2)
  const activeGroup = savedState.layout.groups.find((group: any) => group.id === savedState.layout.activeGroupId)
  const activeTab = activeGroup.tabs.find((tab: any) => tab.id === activeGroup.activeTabId)
  await Command.execute('Viewlet.executeViewletCommand', activeTab.editorUid, 'handleContextMenu', 'image', 10, 10)

  const menuItems = Locator('.MenuItem')
  const copyPath = menuItems.nth(0)
  const copyImage = menuItems.nth(1)
  await expect(menuItems).toHaveCount(2)
  await expect(copyPath).toHaveText('Copy Path')
  await expect(copyImage).toHaveText('Copy Image')
}
