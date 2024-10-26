import * as MediaPreviewWorker from '../MediaPreviewWorker/MediaPreviewWorker.ts'

const id = 1

export const webViewProvider = {
  id: 'builtin.media-preview',
  async create(webView, uri, savedState) {
    // TODO if can use remote uri, use remote uri, else read file
    // @ts-ignore
    const remoteUrl = await MediaPreviewWorker.invoke('MediaPreview.getUrl', uri)
    await MediaPreviewWorker.invoke('MediaPreview.create', id)
    await MediaPreviewWorker.invoke('MediaPreview.setSavedState', id, savedState)
    await webView.invoke('initialize', remoteUrl)
    // @ts-ignore
    webViewProvider.webView = webView
    const newState = await MediaPreviewWorker.invoke('MediaPreview.getState', id)
    await webViewProvider.commands.update(newState)
  },
  async open(uri, webView) {},
  async saveState() {
    const state = await MediaPreviewWorker.invoke('MediaPreview.saveState', id)
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
      // @ts-ignore
      await MediaPreviewWorker.invoke('MediaPreview.handlePointerDown', id, x, y)
      const newState = await MediaPreviewWorker.invoke('MediaPreview.getState', id)
      return webViewProvider.commands.update(newState)
    },
    async handlePointerMove(x, y) {
      // @ts-ignore
      await MediaPreviewWorker.invoke('MediaPreview.handlePointerMove', id, x, y)
      const newState = await MediaPreviewWorker.invoke('MediaPreview.getState', id)
      return webViewProvider.commands.update(newState)
    },
    async handlePointerUp(x, y) {
      // @ts-ignore
      await MediaPreviewWorker.invoke('MediaPreview.handlePointerUp', id, x, y)
      const newState = await MediaPreviewWorker.invoke('MediaPreview.getState', id)
      return webViewProvider.commands.update(newState)
    },
  },
}
