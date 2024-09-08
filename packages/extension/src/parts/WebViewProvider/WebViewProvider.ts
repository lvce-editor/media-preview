import * as MediaPreviewWorker from '../MediaPreviewWorker/MediaPreviewWorker.ts'

const previewId = 1

export const webViewProvider = {
  id: 'builtin.media-preview',
  async create(webView, uri) {
    console.log({ uri })
    // TODO if can use remote uri, use remote uri, else read file
    // @ts-ignore
    const remoteUrl = await MediaPreviewWorker.invoke('MediaPreview.getUrl', uri)
    await webView.invoke('initialize', remoteUrl)
    // @ts-ignore
    webViewProvider.webView = webView
    await MediaPreviewWorker.invoke('MediaPreview.create', previewId)
  },
  async open(uri, webView) {},
  commands: {
    // TODO support zoom
    // TODO support drag via mouse move
    async update(newState) {
      // @ts-ignore
      await webViewProvider.webView.invoke('update', newState)
    },
    async handlePointerDown(x, y) {
      // @ts-ignore
      const newState = await MediaPreviewWorker.invoke('MediaPreview.handlePointerDown', previewId, x, y)
      return webViewProvider.commands.update(newState)
    },
    async handlePointerMove(x, y) {
      // @ts-ignore
      const newState = await MediaPreviewWorker.invoke('MediaPreview.handlePointerMove', previewId, x, y)
      return webViewProvider.commands.update(newState)
    },
    async handlePointerUp(x, y) {
      // @ts-ignore
      const newState = await MediaPreviewWorker.invoke('MediaPreview.handlePointerUp', previewId, x, y)
      return webViewProvider.commands.update(newState)
    },
  },
}
