import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-copy-image'

export const test: Test = async ({ expect, Locator, Main }) => {
  const imageUri = import.meta.resolve('../files/file.png')
  await Main.openUri(imageUri)

  const image = Locator('.MediaPreviewImage')
  await expect(image).toHaveCount(1)
  // eslint-disable-next-line e2e/no-direct-click -- A trusted right-click is required to exercise image clipboard permissions.
  await image.click({ button: 'right' })
  const firstMenuItem = Locator('.MenuItem').nth(0)
  let lastError: unknown
  for (let i = 0; i < 20; i++) {
    try {
      await expect(firstMenuItem).toBeVisible()
      lastError = undefined
      break
    } catch (error) {
      lastError = error
      await new Promise((resolve) => globalThis.setTimeout(resolve, 50))
    }
  }
  if (lastError) {
    throw lastError
  }

  const copyImage = Locator('.MenuItem').nth(1)
  await expect(copyImage).toHaveText('Copy Image')
  // eslint-disable-next-line e2e/no-direct-click -- A trusted click is required to exercise image clipboard permissions.
  await copyImage.click()
}
