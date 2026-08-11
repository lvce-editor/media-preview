export interface DecodedImage {
  readonly data: Readonly<ArrayLike<number>>
  readonly height: number
  readonly width: number
}

type CreateCanvas = (width: number, height: number) => OffscreenCanvas
type CreateImageData = (data: Readonly<ArrayLike<number>>, width: number, height: number) => ImageData

const PngMimeType = 'image/png'
const WebpMimeType = 'image/webp'
const WebpQuality = 0.9

const createCanvas = (width: number, height: number): OffscreenCanvas => {
  return new OffscreenCanvas(width, height)
}

const createImageData = (data: Readonly<ArrayLike<number>>, width: number, height: number): ImageData => {
  return new ImageData(data as Uint8ClampedArray<ArrayBuffer>, width, height)
}

const encodePng = (canvas: Readonly<OffscreenCanvas>): Promise<Blob> => {
  return canvas.convertToBlob({ type: PngMimeType })
}

export const encodeImageToPreviewWithDependencies = async (
  image: Readonly<DecodedImage>,
  createCanvasFn: CreateCanvas,
  createImageDataFn: CreateImageData,
): Promise<Blob> => {
  const canvas = createCanvasFn(image.width, image.height)
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Failed to create 2D canvas context')
  }
  const imageData = createImageDataFn(image.data, image.width, image.height)
  context.putImageData(imageData, 0, 0)

  try {
    const preview = await canvas.convertToBlob({
      quality: WebpQuality,
      type: WebpMimeType,
    })
    if (preview.type === WebpMimeType || preview.type === PngMimeType) {
      return preview
    }
  } catch {
    // WebP encoding is optional. Browser-native PNG remains available as a fallback.
  }
  return encodePng(canvas)
}

export const encodeImageToPreview = async (image: Readonly<DecodedImage>): Promise<Blob> => {
  return encodeImageToPreviewWithDependencies(image, createCanvas, createImageData)
}
