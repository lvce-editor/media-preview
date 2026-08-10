import { createRpc } from '@lvce-editor/api'

interface Rpc {
  readonly invoke: (method: string, ...params: readonly unknown[]) => Promise<unknown>
}

type CreateRpc = (options: { readonly id: string }) => Promise<Rpc>

export const state: {
  createRpc: CreateRpc
  rpcPromise: Promise<Rpc> | undefined
} = {
  createRpc,
  rpcPromise: undefined,
}

const getRpc = (): Promise<Rpc> => {
  const { createRpc, rpcPromise } = state
  if (rpcPromise) {
    return rpcPromise
  }
  const newRpcPromise = createRpc({
    id: 'builtin.media-preview.image-conversion-worker',
  })
  state.rpcPromise = newRpcPromise
  return newRpcPromise
}

export const convertHeicToPng = async (heic: Blob): Promise<Blob> => {
  const rpc = await getRpc()
  return rpc.invoke('ImageConversion.convertHeicToPng', heic) as Promise<Blob>
}

export const convertTiffToPng = async (tiff: Blob): Promise<Blob> => {
  const rpc = await getRpc()
  return rpc.invoke('ImageConversion.convertTiffToPng', tiff) as Promise<Blob>
}
