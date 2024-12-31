import { packageExtension, bundleJs, replace } from '@lvce-editor/package-extension'
import fs, { readFileSync } from 'node:fs'
import path, { join } from 'node:path'
import { root } from './root.js'

const extension = path.join(root, 'packages', 'extension')
const mediaPreviewWorker = path.join(root, 'packages', 'media-preview-worker')

fs.rmSync(join(root, 'dist'), { recursive: true, force: true })

fs.mkdirSync(path.join(root, 'dist'))

const packageJson = JSON.parse(readFileSync(join(extension, 'package.json')).toString())
delete packageJson.xo
delete packageJson.jest
delete packageJson.prettier
delete packageJson.devDependencies

fs.writeFileSync(join(root, 'dist', 'package.json'), JSON.stringify(packageJson, null, 2) + '\n')
fs.copyFileSync(join(root, 'README.md'), join(root, 'dist', 'README.md'))
fs.copyFileSync(join(root, 'LICENSE'), join(root, 'dist', 'LICENSE'))
fs.copyFileSync(join(extension, 'extension.json'), join(root, 'dist', 'extension.json'))
fs.cpSync(join(extension, 'src'), join(root, 'dist', 'src'), {
  recursive: true,
})
fs.cpSync(join(extension, 'media'), join(root, 'dist', 'media'), {
  recursive: true,
})

fs.cpSync(join(mediaPreviewWorker, 'src'), join(root, 'dist', 'media-preview-worker', 'src'), {
  recursive: true,
})

await replace({
  path: join(root, 'dist', 'extension.json'),
  occurrence: 'src/mediaPreviewMain.ts',
  replacement: 'dist/mediaPreviewMain.js',
})

await bundleJs(
  join(root, 'dist', 'media-preview-worker', 'src', 'mediaPreviewWorkerMain.ts'),
  join(root, 'dist', 'media-preview-worker', 'dist', 'mediaPreviewWorkerMain.js'),
)

await bundleJs(join(root, 'dist', 'src', 'mediaPreviewMain.ts'), join(root, 'dist', 'dist', 'mediaPreviewMain.js'))

await packageExtension({
  highestCompression: true,
  inDir: join(root, 'dist'),
  outFile: join(root, 'extension.tar.br'),
})
