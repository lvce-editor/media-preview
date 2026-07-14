import { createRpc } from '@lvce-editor/api'
import { getMediaPreviewWorkerUrl } from '../MediaPreviewWorkerUrl/MediaPreviewWorkerUrl.ts'

interface Rpc {
  readonly invoke: (method: string, ...params: readonly unknown[]) => Promise<any>
}

const state = {
  rpcPromise: undefined as Promise<Rpc> | undefined,
}

const createMediaPreviewRpc = (): Promise<Rpc> => {
  return createRpc({
    name: 'Media Preview Worker',
    url: getMediaPreviewWorkerUrl(),
  })
}

const getRpc = (): Promise<Rpc> => {
  state.rpcPromise ||= createMediaPreviewRpc()
  return state.rpcPromise
}

export const invoke = async (method: string, ...params: readonly unknown[]): Promise<any> => {
  const rpc = await getRpc()
  return rpc.invoke(method, ...params)
}
