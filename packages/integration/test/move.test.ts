import { expect, test } from '@jest/globals'
import { testWorker } from '../src/testWorker.js'

test('move', async () => {
  const execMap = {}
  const worker = await testWorker({
    execMap,
  })
  const id = 1
  await worker.execute('MediaPreview.create', id)
  const newState1 = await worker.execute('MediaPreview.handlePointerDown', id, 10, 10)
  expect(newState1.pointerDown).toBe(true)
  expect(newState1.domMatrix).toEqual({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 })
  const newState2 = await worker.execute('MediaPreview.handlePointerMove', id, 20, 30)
  expect(newState2.domMatrix).toEqual({ a: 1, b: 0, c: 0, d: 1, e: 10, f: 20 })
  const newState3 = await worker.execute('MediaPreview.handlePointerUp', id, 10, 10)
  expect(newState3.pointerDown).toBe(false)
  expect(newState3.domMatrix).toEqual({ a: 1, b: 0, c: 0, d: 1, e: 10, f: 20 })
})
