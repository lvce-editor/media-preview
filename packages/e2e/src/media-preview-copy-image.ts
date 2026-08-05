import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-copy-image'

export const test: Test = async ({ Command, ContextMenu, expect, Locator, Main }) => {
  const imageUri = import.meta.resolve('../files/file.png')
  await Main.openUri(imageUri)

  const image = Locator('.MediaPreviewImage')
  await expect(image).toHaveCount(1)
  const savedState: any = await Main.saveState(2)
  const activeGroup = savedState.layout.groups.find((group: any) => group.id === savedState.layout.activeGroupId)
  const activeTab = activeGroup.tabs.find((tab: any) => tab.id === activeGroup.activeTabId)
  await Command.execute('Viewlet.executeViewletCommand', activeTab.editorUid, 'handleContextMenu', 'image', 10, 10)
  await ContextMenu.selectItem('Copy Image')
}
