export const name = 'media-preview-png-error'

export const test = async ({ Workspace, FileSystem, Main, Editor, Locator, expect, WebView }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  const text = `abc`
  await FileSystem.writeFile(`${tmpDir}/test.png`, text)
  await Workspace.setPath(tmpDir)

  // act
  await Main.openUri(`${tmpDir}/test.png`)

  // assert

  // TODO verify that error message is displayed
  // const webView = await WebView.fromId(`builtin.media-preview`)
  // console.log({ webView })
}
