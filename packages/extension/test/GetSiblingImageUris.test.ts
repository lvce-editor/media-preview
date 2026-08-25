import type { FileSystemDirent } from '@lvce-editor/api'
import { expect, jest, test } from '@jest/globals'
import { getSiblingImageUrisWithDependency } from '../src/parts/GetSiblingImageUris/GetSiblingImageUris.ts'

const file = (name: string): FileSystemDirent => ({ name, type: 7 })

const imageExtensions = ['.gif', '.jpg', '.png', '.svg', '.webp']

test('returns naturally sorted image siblings for a path', async () => {
  const readDirectory = jest.fn(async (_uri: string) => [
    file('image10.png'),
    file('notes.txt'),
    file('image2.JPG'),
    file('image1.svg'),
  ])

  await expect(getSiblingImageUrisWithDependency('/workspace/image2.JPG', imageExtensions, readDirectory)).resolves.toEqual([
    '/workspace/image1.svg',
    '/workspace/image2.JPG',
    '/workspace/image10.png',
  ])
  expect(readDirectory).toHaveBeenCalledWith('file:///workspace/')
})

test('preserves encoded file uris', async () => {
  const readDirectory = jest.fn(async (_uri: string) => [file('first image.png'), file('second # image.webp')])

  await expect(
    getSiblingImageUrisWithDependency('file:///pictures/first%20image.png', imageExtensions, readDirectory),
  ).resolves.toEqual(['file:///pictures/first%20image.png', 'file:///pictures/second%20%23%20image.webp'])
  expect(readDirectory).toHaveBeenCalledWith('file:///pictures/')
})

test('supports windows paths', async () => {
  const readDirectory = jest.fn(async (_uri: string) => [file('a.png'), file('b.gif')])

  await expect(getSiblingImageUrisWithDependency('C:\\pictures\\b.gif', imageExtensions, readDirectory)).resolves.toEqual([
    'C:\\pictures\\a.png',
    'C:\\pictures\\b.gif',
  ])
  expect(readDirectory).toHaveBeenCalledWith('file:///C:/pictures/')
})

test('returns no siblings when the uri has no parent', async () => {
  const readDirectory = jest.fn(async (_uri: string) => [file('image.png')])

  await expect(getSiblingImageUrisWithDependency('image.png', imageExtensions, readDirectory)).resolves.toEqual([])
  expect(readDirectory).not.toHaveBeenCalled()
})

test('returns no siblings when the current image is absent', async () => {
  const readDirectory = jest.fn(async (_uri: string) => [file('other.png')])

  await expect(getSiblingImageUrisWithDependency('/workspace/image.png', imageExtensions, readDirectory)).resolves.toEqual([])
})

test('handles malformed uri encoding', async () => {
  const readDirectory = jest.fn(async (_uri: string) => [file('%image.png'), file('other.png')])

  await expect(getSiblingImageUrisWithDependency('file:///pictures/%image.png', imageExtensions, readDirectory)).resolves.toEqual(
    ['file:///pictures/%25image.png', 'file:///pictures/other.png'],
  )
})

test('uses the provided image extensions', async () => {
  const readDirectory = jest.fn(async (_uri: string) => [file('image.custom'), file('other.png')])

  await expect(getSiblingImageUrisWithDependency('/workspace/image.custom', ['.custom'], readDirectory)).resolves.toEqual([
    '/workspace/image.custom',
  ])
})
