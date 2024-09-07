// TODO use virtual dom in  worker

const initialize = (remoteUrl) => {
  const app = document.createElement('div')
  app.className = 'App'

  const image = document.createElement('img')
  image.className = 'Image'
  image.src = remoteUrl
  image.alt = ''
  app.append(image)

  document.body.append(app)
}

const rpc = globalThis.lvceRpc({
  initialize,
})
