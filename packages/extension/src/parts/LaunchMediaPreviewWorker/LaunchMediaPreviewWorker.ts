import * as MediaPreviewWorkerUrl from '../MediaPreviewWorkerUrl/MediaPreviewWorkerUrl.ts'

export const launchMediaPreviewWorker = async () => {
  // @ts-ignore
  const rpc = await vscode.createRpc({
    url: MediaPreviewWorkerUrl.mediaPreviewWorkerUrl,
    name: 'Media Preview Worker',
    commandMap: {},
  })
  return rpc
}
