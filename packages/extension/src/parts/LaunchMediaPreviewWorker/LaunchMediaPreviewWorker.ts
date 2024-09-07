import * as HeapSnapshotWorkerUrl from '../HeapSnapshotWorkerUrl/HeapSnapshotWorkerUrl.ts'

const execute = (method, ...params) => {
  return {}
}

export const launchMediaPreviewWorker = async () => {
  // @ts-ignore
  const rpc = await vscode.createRpc({
    url: HeapSnapshotWorkerUrl.heapSnapshotWorkerUrl,
    name: 'Media Preview Worker',
    execute,
  })
  return rpc
}
