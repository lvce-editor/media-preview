import * as MediaPreviewWorkerUrl from '../MediaPreviewWorkerUrl/MediaPreviewWorkerUrl.ts'

const execute = (method, ...params) => {
  return {}
}

export const launchMediaPreviewWorker = async () => {
  // @ts-ignore
  const rpc = await vscode.createRpc({
    url: MediaPreviewWorkerUrl.mediaPreviewWorkerUrl,
    name: 'Media Preview Worker',
    execute,
  })
  return rpc
}
