// TODO use virtual dom in  worker

const handlePointerDown = async (event) => {
  const { target, clientX, clientY, pointerId } = event
  target.setPointerCapture(pointerId)
  target.addEventListener('pointermove', handlePointerMove)
  await rpc.invoke('handlePointerDown', clientX, clientY)
}

const handlePointerUp = () => {}

const handlePointerMove = async (event) => {
  const { clientX, clientY } = event
  await rpc.invoke('handlePointerDown', clientX, clientY)
}

const initialize = (remoteUrl) => {
  const app = document.createElement('div')
  app.className = 'App'
  app.addEventListener('pointerdown', handlePointerDown)
  app.addEventListener('pointercapturelos', handlePointerUp)

  const image = document.createElement('img')
  image.className = 'Image'
  image.src = remoteUrl
  image.alt = ''
  app.append(image)

  document.body.append(app)
}

const update = (x, y) => {
  const app = document.querySelector('.App')
  const el = document.createElement('div')
  el.textContent = `x${x}, y:${y}`
  app?.append(el)
}

const rpc = globalThis.lvceRpc({
  initialize,
  update,
})
