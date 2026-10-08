import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-invalid-svg-error'

export const test: Test = async ({ Command, Editor, expect, FileSystem, Locator, Main }) => {
  const tmpDir = await FileSystem.getTmpDir()
  const uri = `${tmpDir}/invalid.svg`
  const content = 'not a valid svg image'
  await FileSystem.writeFile(uri, content)
  await Main.openUri(uri)

  const error = Locator('.MediaPreviewError')
  await expect(error).toBeVisible()
  const errorMessage = Locator('.MediaPreviewErrorMessage')
  await expect(errorMessage).toHaveText('Image could not be loaded')

  const openInTextEditor = Locator('.MediaPreviewOpenInTextEditor')
  await expect(openInTextEditor).toBeVisible()
  await expect(openInTextEditor).toHaveText('Open in Text Editor')
  const states = await Command.execute('Viewlet.getAllStates')
  const mediaPreview = Object.values(states).find(({ viewId }: any) => viewId === 'builtin.media-preview') as any
  await Command.execute('Viewlet.executeViewletCommand', mediaPreview.uid, 'handleViewCommand', 'handleOpenInTextEditor')

  const editorContent = Locator('.EditorContent')
  await expect(editorContent).toBeVisible()
  await Editor.shouldHaveText(content)
}
