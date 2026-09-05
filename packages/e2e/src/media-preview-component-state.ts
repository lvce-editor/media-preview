import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'media-preview-component-state'

interface ComponentInfo {
  readonly editable: boolean
  readonly moduleId: string
  readonly uid: number
}

export const test: Test = async ({ Command, expect, FileSystem, Locator, Main }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/state.png`, '')
  await Main.openUri(`${tmpDir}/state.png`)
  const errorMessage = Locator('.MediaPreviewError')
  await expect(errorMessage).toBeVisible()
  const components = (await Command.execute('ComponentState.getComponents')) as readonly ComponentInfo[]
  const component = components.find((item) => item.moduleId === 'ExtensionView')
  if (!component?.editable) {
    throw new Error('Expected editable extension component state')
  }
  const state = await Command.execute('ComponentState.getState', component.uid)
  const { image, view } = state
  if (!image.domMatrix || !view.error) {
    throw new Error('Expected live image and view state')
  }
  await Command.execute('ComponentState.setState', component.uid, {
    ...state,
    view: { ...view, errorMessage: 'Inspector image error' },
  })
  await expect(errorMessage).toContainText('Inspector image error')
}
