import { expect, test } from '@jest/globals'
import { shouldUpgradeImage } from '../src/parts/ShouldUpgradeImage/ShouldUpgradeImage.ts'

test('upgrades when transformed display pixels reach 90% of either preview dimension', () => {
  expect(
    shouldUpgradeImage({
      containerHeight: 768,
      containerWidth: 1024,
      devicePixelRatio: 1,
      originalHeight: 3072,
      originalWidth: 4096,
      previewHeight: 1536,
      previewWidth: 2048,
      scale: 1.8,
    }),
  ).toBe(true)
})

test('does not upgrade below the threshold', () => {
  expect(
    shouldUpgradeImage({
      containerHeight: 768,
      containerWidth: 1024,
      devicePixelRatio: 1,
      originalHeight: 3072,
      originalWidth: 4096,
      previewHeight: 1536,
      previewWidth: 2048,
      scale: 1.79,
    }),
  ).toBe(false)
})

test('does not upscale the fitted image before applying zoom', () => {
  expect(
    shouldUpgradeImage({
      containerHeight: 2000,
      containerWidth: 3000,
      devicePixelRatio: 1,
      originalHeight: 1000,
      originalWidth: 2000,
      previewHeight: 1000,
      previewWidth: 2000,
      scale: 0.89,
    }),
  ).toBe(false)
})

test('rejects invalid dimensions', () => {
  expect(
    shouldUpgradeImage({
      containerHeight: 0,
      containerWidth: 1024,
      devicePixelRatio: 2,
      originalHeight: 3072,
      originalWidth: 4096,
      previewHeight: 1536,
      previewWidth: 2048,
      scale: 2,
    }),
  ).toBe(false)
})
