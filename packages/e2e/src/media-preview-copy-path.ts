import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-copy-path'

export const test: Test = async ({ ClipBoard, Command, ContextMenu, expect, Locator, Main }) => {
  const imageUri = import.meta.resolve('../files/file.png')
  await Main.openUri(imageUri)

  await ClipBoard.enableMemoryClipBoard()
  try {
    const image = Locator('.MediaPreviewImage')
    await expect(image).toHaveCount(1)
    const savedState: any = await Main.saveState(2)
    const activeGroup = savedState.layout.groups.find((group: any) => group.id === savedState.layout.activeGroupId)
    const activeTab = activeGroup.tabs.find((tab: any) => tab.id === activeGroup.activeTabId)
    await Command.execute('Viewlet.executeViewletCommand', activeTab.editorUid, 'handleContextMenu', 'image', 10, 10)
    await ContextMenu.selectItem('Copy Path')

    await ClipBoard.shouldHaveText(imageUri)
  } finally {
    await ClipBoard.disableMemoryClipBoard()
  }
}
