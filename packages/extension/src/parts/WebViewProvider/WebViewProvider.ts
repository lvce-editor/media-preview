import * as MediaPreview from '../MediaPreview/MediaPreview.ts'

const id = 1

export const webViewProvider = {
  id: 'builtin.media-preview',
  async create(webView, uri, savedState) {
    // TODO if can use remote uri, use remote uri, else read file
    // @ts-ignore
    const remoteUrl = await vscode.getRemoteUrl(uri, {
      webViewId: webViewProvider.id,
    })
    await MediaPreview.create(id)
    await MediaPreview.setSavedState(id, savedState)
    await webView.invoke('initialize', remoteUrl)
    // @ts-ignore
    webViewProvider.webView = webView
    const newState = await MediaPreview.getState(id)
    await webViewProvider.commands.update(newState)
  },
  async open(uri, webView) {},
  async saveState() {
    const state = await MediaPreview.saveState(id)
    return state
  },
  commands: {
    // TODO support zoom
    // TODO support drag via mouse move
    async update(newState) {
      // @ts-ignore
      await webViewProvider.webView.invoke('update', newState)
    },
    async handlePointerDown(x, y) {
      await MediaPreview.handlePointerDown(id, x, y)
      const newState = await MediaPreview.getState(id)
      return webViewProvider.commands.update(newState)
    },
    async handlePointerMove(x, y) {
      await MediaPreview.handlePointerMove(id, x, y)
      const newState = await MediaPreview.getState(id)
      return webViewProvider.commands.update(newState)
    },
    async handlePointerUp(x, y) {
      await MediaPreview.handlePointerUp(id, x, y)
      const newState = await MediaPreview.getState(id)
      return webViewProvider.commands.update(newState)
    },
    async handleWheel(eventX, eventY, deltaX, deltaY) {
      await MediaPreview.handleWheel(id, eventX, eventY, deltaX, deltaY)
      const newState = await MediaPreview.getState(id)
      return webViewProvider.commands.update(newState)
    },
  },
}
