import { spawn } from 'child_process'
import { join } from 'path'
import { root } from './root.js'

const serverPath = join(root, 'packages', 'server', 'node_modules', '@lvce-editor', 'server', 'bin', 'server.js')
const esbuildPath = join(root, 'packages', 'build', 'node_modules', '.bin', 'esbuild')

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
      '--bundle',
      '--watch',
      'packages/media-preview-worker/src/mediaPreviewWorkerMain.ts',
      '--outfile=packages/media-preview-worker/dist/mediaPreviewWorkerMain.js',
    ],
    {
      cwd: root,
      stdio: 'inherit',
    },
  )
  const child3 = spawn(
    esbuildPath,
    [
      '--format=esm',
      '--bundle',
      '--external:node:buffer',
      '--external:electron',
      '--external:ws',
      '--external:node:worker_threads',
      '--bundle',
      '--watch',
      'packages/extension/src/mediaPreviewMain.ts',
      '--outfile=packages/extension/dist/mediaPreviewMain.js',
    ],
    {
      cwd: root,
    },
  )
}

main()
