import * as MediaPreviewWorker from '../MediaPreviewWorker/MediaPreviewWorker.ts'

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
    // @ts-ignore
    webViewProvider.state = {
      x: 0,
      y: 0,
    }
  },
  async open(uri, webView) {},
  commands: {
    // TODO support zoom
    // TODO support drag via mouse move
    async update(x, y) {
      // @ts-ignore
      webViewProvider.state.x = x
      // @ts-ignore
      webViewProvider.state.y = y
      // @ts-ignore
      await webViewProvider.webView.invoke('update', webViewProvider.state.x, webViewProvider.state.y)
    },
    async handlePointerDown(x, y) {
      return webViewProvider.commands.update(x, y)
    },
    handlePointerMove(x, y) {
      return webViewProvider.commands.update(x, y)
    },
  },
}
