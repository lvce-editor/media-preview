import { replace } from '@lvce-editor/package-extension'
import { exportStatic } from '@lvce-editor/shared-process'
import { cp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import path, { join } from 'node:path'
import { root } from './root.js'

await import('./build.js')

await cp(path.join(root, 'dist'), path.join(root, 'dist2'), {
  recursive: true,
  force: true,
})

const { commitHash } = await exportStatic({
  extensionPath: 'packages/extension',
  root,
})

await cp(path.join(root, 'dist2'), path.join(root, 'dist', commitHash, 'extensions', 'builtin.media-preview'), {
  recursive: true,
  force: true,
})

await replace({
  path: path.join(root, 'dist', commitHash, 'config', 'webExtensions.json'),
  occurrence: 'src/mediaPreviewMain.ts',
  replacement: 'dist/mediaPreviewMain.js',
})

const pathPrefix = '/media-preview'
const webViewsPath = join(root, 'dist', commitHash, 'config', 'webViews.json')
const extensionJsonPath = join(root, 'dist', commitHash, 'extensions', 'builtin.media-preview', 'extension.json')
const extensionJsonContent = await readFile(extensionJsonPath, 'utf8')
const extensionJson = JSON.parse(extensionJsonContent)
extensionJson.webViews[0].path = `${commitHash}/extensions/${extensionJson.id}/${extensionJson.webViews[0].path}`
extensionJson.webViews[0].remotePath = `${pathPrefix}/${commitHash}/extensions/${extensionJson.id}`
await writeFile(webViewsPath, JSON.stringify(extensionJson.webViews, null, 2) + '\n')

await rm(join(root, 'dist', commitHash, 'playground'), { recursive: true, force: true })
await cp(join(root, 'packages', 'sample-files', 'files'), join(root, 'dist', commitHash, 'playground'), {
  recursive: true,
})

const dirents = await readdir(join(root, 'dist', commitHash, 'playground'))
const fileMap = dirents.map((dirent) => `/playground/${dirent}`)
await writeFile(join(root, 'dist', commitHash, 'config', 'fileMap.json'), JSON.stringify(fileMap, null, 2) + '\n')
