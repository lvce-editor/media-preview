const isDecodingError = (event) => {
  return event.code === 4
}

const getMessage = (event) => {
  if (isDecodingError(event)) {
    return `Failed to decode image: ${event.message}`
  }
  return `Failed to load image: ${event.message}`
}

export class ImageLoadError extends Error {
  code: any

  constructor(event) {
    const message = getMessage(event)
    super(message)
    this.name = 'ImageLoadError'
    this.code = event.code
  }
}
