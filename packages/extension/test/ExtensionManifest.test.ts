import { expect, test } from '@jest/globals'
import { readFileSync } from 'node:fs'

interface ExtensionManifest {
  readonly workerName: string
}

const manifestUrl = new URL('../extension.json', import.meta.url)
const manifest = JSON.parse(readFileSync(manifestUrl, 'utf8')) as ExtensionManifest

test('uses the media preview worker name', () => {
  expect(manifest.workerName).toBe('Media Preview Worker')
})
