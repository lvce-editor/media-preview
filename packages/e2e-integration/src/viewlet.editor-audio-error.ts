import type { Test } from '@lvce-editor/test-with-playwright'

// TODO avoid flickering when loading audio fails

export const name = 'viewlet.editor-audio-error'

export const skip = true

export const test: Test = async ({ expect, FileSystem, Locator, Main, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file1.mp3`, `abc`)

  await Workspace.setUri(tmpDir)

  // act
  await Main.openUri(`${tmpDir}/file1.mp3`)

  // assert
  const viewletAudio = Locator('.ViewletAudio')
  await expect(viewletAudio).toBeVisible()
  const error = Locator('.ViewletError')
  await expect(error).toBeVisible()

  // TODO
  // await expect(viewletAudio).toHaveText('Failed to load audio')
}
