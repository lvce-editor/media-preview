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

  const imageContent = document.createElement('div')
  imageContent.className = 'ImageContent'

  const image = document.createElement('img')
  image.className = 'ImageElement'
  image.src = remoteUrl
  image.alt = ''

  imageContent.append(image)
  app.append(imageContent)

  document.body.append(app)
}

const update = (state) => {
  const { domMatrix } = state
  const app = document.querySelector('.App')
  // @ts-ignore
  const imageContent = app.querySelector('.ImageContent')
  // @ts-ignore
  imageContent.style.transform = `${domMatrix}`
}

const rpc = globalThis.lvceRpc({
  initialize,
  update,
})
