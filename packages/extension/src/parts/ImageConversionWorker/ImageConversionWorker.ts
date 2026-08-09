import { createRpc, type CreateRpcOptions } from '@lvce-editor/api'

interface Rpc {
  readonly invoke: (method: string, ...params: readonly unknown[]) => Promise<unknown>
}

type CreateRpc = (options: CreateRpcOptions) => Promise<Rpc>

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
    contentSecurityPolicy: "default-src 'none'; script-src 'self' 'unsafe-eval'",
    name: 'Media Preview Image Conversion Worker',
    url: new URL('imageConversionWorkerMain.js', import.meta.url).href,
  })
  state.rpcPromise = newRpcPromise
  return newRpcPromise
}

export const convertHeicToPng = async (heic: Blob): Promise<Blob> => {
  const rpc = await getRpc()
  return rpc.invoke('ImageConversion.convertHeicToPng', heic) as Promise<Blob>
}
