import { spawn } from 'child_process'
import { join } from 'path'
import { root } from './root.js'

const serverPath = join(root, 'node_modules', '@lvce-editor', 'server', 'bin', 'server.js')
const esbuildPath = join(root, 'node_modules', '.bin', 'esbuild')

const main = () => {
  const child = spawn(serverPath, ['--only-extension=packages/extension', '--test-path=packages/e2e'], {
    stdio: 'inherit',
  })
  const child2 = spawn(
    esbuildPath,
    [
      '--format=esm',
      '--bundle',
      '--external:node:buffer',
      '--external:electron',
      '--external:ws',
      '--external:node:worker_threads',
      '--watch',
      'packages/extension/src/mediaPreviewMain.ts',
      'packages/image-conversion-worker/src/imageConversionWorkerMain.ts',
      '--outdir=packages/extension/dist',
    ],
    {
      cwd: root,
      stdio: 'inherit',
    },
  )
}

main()
