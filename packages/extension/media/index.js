// TODO use virtual dom in  worker

const handlePointerDown = async (event) => {
  const { target, clientX, clientY, pointerId } = event
  event.preventDefault()
  target.setPointerCapture(pointerId)
  target.addEventListener('pointermove', handlePointerMove)
  await rpc.invoke('handlePointerDown', clientX, clientY)
}

const handlePointerUp = async (event) => {
  const { target } = event
  target.removeEventListener('pointermove', handlePointerMove)
  await rpc.invoke('handlePointerUp')
}

const handlePointerMove = async (event) => {
  const { clientX, clientY } = event
  await rpc.invoke('handlePointerMove', clientX, clientY)
}

const initialize = (remoteUrl) => {
  const app = document.createElement('div')
  app.className = 'App'
  app.addEventListener('pointerdown', handlePointerDown)
  app.addEventListener('pointerup', handlePointerUp)

  const image = document.createElement('img')
  image.className = 'Image'
  image.src = remoteUrl
  image.alt = ''
  app.append(image)

  document.body.append(app)
}

const update = (state) => {
  const { domMatrix } = state
  const app = document.querySelector('.App')
  // @ts-ignore
  const image = app.querySelector('.Image')
  // @ts-ignore
  image.style.transform = `${domMatrix}`
}

const rpc = globalThis.lvceRpc({
  initialize,
  update,
})
