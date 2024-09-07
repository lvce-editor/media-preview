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
    this.webView = webView
  },
  async open(uri, webView) {},
  commands: {
    // TODO support zoom
    // TODO support drag via mouse move
    async handleInput(text) {},
  },
}
