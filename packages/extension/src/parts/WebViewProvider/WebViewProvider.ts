export const webViewProvider = {
  id: 'builtin.media-preview',
  async create(webView, uri) {
    // TODO if can use remote uri, use remote uri, else read file
    // @ts-ignore
    const content = await vscode.readFile(uri)
    await webView.invoke('initialize', content)
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
