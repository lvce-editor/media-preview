export const name = 'media-preview'

export const skip = true

export const test = async ({ Workspace, FileSystem, Main, Editor, Locator, expect }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()

  const url = new URL('../files/file.png', import.meta.url)
  const response = await fetch(url)
  const text = await response.text()
  // TODO allow file system write to accept arraybuffer
  await FileSystem.writeFile(`${tmpDir}/test.png`, text)
  await Workspace.setPath(tmpDir)

  // act
  await Main.openUri(`${tmpDir}/test.png`)

  // assert

  // TODO verify that svg is visible
}
