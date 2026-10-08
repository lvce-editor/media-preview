import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-missing-absolute-path-error'

const waitForExpectation = async (assertion: () => Promise<void>): Promise<void> => {
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      await assertion()
      return
    } catch {
      // eslint-disable-next-line e2e/no-timeouts -- The test framework has no observable wait for the async error state.
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  }
  await assertion()
}

const toAbsolutePath = (fileUri: string): string => {
  return /^file:\/\/\/[a-z]:/i.test(fileUri) ? fileUri.slice('file:///'.length) : fileUri.slice('file://'.length)
}

export const test: Test = async ({ expect, FileSystem, Locator, Main }) => {
  const tmpDir = await FileSystem.getTmpDir({ scheme: 'file' })
  await Main.openUri(`${toAbsolutePath(tmpDir)}/missing.svg`)

  const error = Locator('.MediaPreviewError')
  const openInTextEditor = Locator('.MediaPreviewOpenInTextEditor')
  await waitForExpectation(() => expect(error).toBeVisible())
  await expect(error).toHaveText('Image could not be found')
  await expect(openInTextEditor).toHaveCount(0)
}
