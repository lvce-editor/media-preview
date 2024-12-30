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

const handleWheel = async (event) => {
  const { clientX, clientY, deltaX, deltaY } = event
  await rpc.invoke('handleWheel', clientX, clientY, deltaX, deltaY)
}

const handleImageError = async () => {
  await rpc.invoke('handleError')
}

const waitForImageReady = ($Element) => {
  const handleError = (event) => {
    cleanup(event)
  }

  const handleLoad = (event) => {
    cleanup(event)
  }

  // @ts-ignore
  const { resolve, promise } = Promise.withResolvers()
  const cleanup = (event) => {
    $Element.removeEventListener('error', handleError)
    $Element.removeEventListener('load', handleLoad)
    resolve(event)
  }

  $Element.addEventListener('error', handleError)
  $Element.addEventListener('load', handleLoad)
  return promise
}

const serializeErrorEvent = (event) => {
  const { target } = event
  const { error } = target
  const { code, message } = error
  return {
    type: 'error',
    code,
    message,
  }
}

const serializeLoadEvent = (event) => {
  return {
    type: 'load',
  }
}

const serializeEvent = (event) => {
  if (event.type === 'error') {
    return serializeErrorEvent(event)
  }
  return serializeLoadEvent(event)
}

const initialize = async (remoteUrl) => {
  const app = document.createElement('div')
  app.className = 'App'
  app.addEventListener('pointerdown', handlePointerDown)
  app.addEventListener('pointerup', handlePointerUp)
  app.addEventListener('wheel', handleWheel, { passive: true })

  const imageContent = document.createElement('div')
  imageContent.className = 'ImageContent'

  const image = document.createElement('img')
  image.className = 'ImageElement'
  image.src = remoteUrl
  image.alt = ''
  image.addEventListener('error', handleImageError)

  imageContent.append(image)
  app.append(imageContent)

  document.body.append(app)

  const event = await waitForImageReady(image)
  const serializedEvent = serializeEvent(event)
  return serializedEvent
}

const update = (state) => {
  console.log('update', state)
  const { domMatrixString, pointerDown, error } = state
  const app = document.querySelector('.App')
  // @ts-ignore
  app.classList.toggle('Dragging', pointerDown)
  // @ts-ignore
  const imageContent = app.querySelector('.ImageContent')

  if (error) {
    // @ts-ignore
    imageContent.textContent = `Image could not be loaded`
  } else {
    // @ts-ignore
    imageContent.style.transform = domMatrixString
  }
}

const rpc = globalThis.lvceRpc({
  initialize,
  update,
})
