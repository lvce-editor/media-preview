import { expect, test } from '@jest/globals'
import * as Create from '../src/parts/Create/Create.ts'
import * as HandlePointerUp from '../src/parts/HandlePointerUp/HandlePointerUp.ts'
import * as WebViewStates from '../src/parts/WebViewStates/WebViewStates.ts'

test('handlePointerUp', () => {
  const id = 1
  const x = 0
  const y = 0
  Create.create(id)
  HandlePointerUp.handlePointerUp(id, x, y)
  const newState = WebViewStates.get(id)
  expect(newState.pointerDown).toBe(false)
})
