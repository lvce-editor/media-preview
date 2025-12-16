import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview'

export const test: Test = async ({ Editor, expect, FileSystem, Locator, Main, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(
    `${tmpDir}/test.svg`,
    `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="50" fill="red" />
</svg>`,
  )
  await Workspace.setPath(tmpDir)

  // act
  await Main.openUri(`${tmpDir}/test.svg`)

  // assert

  // TODO verify that svg is visible
}
