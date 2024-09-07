// TODO use virtual dom in  worker

const initialize = (content) => {
  const app = document.createElement('div')
  app.className = 'App'

  const heading = document.createElement('h1')
  heading.textContent = 'hello from media preview'

  app.append(heading)

  document.body.append(app)
}

const rpc = globalThis.lvceRpc({
  initialize,
})
