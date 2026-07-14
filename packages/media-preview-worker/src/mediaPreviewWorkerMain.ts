import { WebWorkerRpcClient } from '@lvce-editor/rpc'
export { commandMap } from './parts/CommandMap/CommandMap.ts'
import { commandMap } from './parts/CommandMap/CommandMap.ts'

const main = async (): Promise<void> => {
  // eslint-disable-next-line unicorn/no-global-object-property-assignment
  globalThis.rpc = await WebWorkerRpcClient.create({ commandMap })
}

// eslint-disable-next-line unicorn/no-top-level-side-effects
await main()
