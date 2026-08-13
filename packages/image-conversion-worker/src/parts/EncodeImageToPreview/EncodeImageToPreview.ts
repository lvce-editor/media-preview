export interface DecodedImage {
  readonly data: Readonly<ArrayLike<number>>
  readonly height: number
  readonly width: number
}

export interface EncodedImage {
  readonly blob: Blob
  readonly height: number
  readonly originalHeight: number
  readonly originalWidth: number
  readonly width: number
}

export type ImageTier = 'full' | 'preview'

type CreateCanvas = (width: number, height: number) => OffscreenCanvas
type CreateImageData = (data: Readonly<ArrayLike<number>>, width: number, height: number) => ImageData

const PngMimeType = 'image/png'
const WebpMimeType = 'image/webp'
const WebpQuality = 0.9
const PreviewMaxDimension = 2048

const createCanvas = (width: number, height: number): OffscreenCanvas => {
  return new OffscreenCanvas(width, height)
}

const createImageData = (data: Readonly<ArrayLike<number>>, width: number, height: number): ImageData => {
  return new ImageData(data as Uint8ClampedArray<ArrayBuffer>, width, height)
}

const encodePng = (canvas: Readonly<OffscreenCanvas>): Promise<Blob> => {
  return canvas.convertToBlob({ type: PngMimeType })
}

const getTargetDimensions = (
  image: Readonly<DecodedImage>,
  tier: ImageTier,
): { readonly height: number; readonly width: number } => {
  if (tier === 'full') {
    return { height: image.height, width: image.width }
  }
  const scale = Math.min(1, PreviewMaxDimension / Math.max(image.width, image.height))
  return {
    height: Math.max(1, Math.round(image.height * scale)),
    width: Math.max(1, Math.round(image.width * scale)),
  }
}

export const encodeImageToPreviewWithDependencies = async (
  image: Readonly<DecodedImage>,
  tier: ImageTier,
  createCanvasFn: CreateCanvas,
  createImageDataFn: CreateImageData,
): Promise<EncodedImage> => {
  const sourceCanvas = createCanvasFn(image.width, image.height)
  const sourceContext = sourceCanvas.getContext('2d')
  if (!sourceContext) {
    throw new Error('Failed to create 2D canvas context')
  }
  const imageData = createImageDataFn(image.data, image.width, image.height)
  sourceContext.putImageData(imageData, 0, 0)
  const { height, width } = getTargetDimensions(image, tier)
  let outputCanvas = sourceCanvas
  if (width !== image.width || height !== image.height) {
    outputCanvas = createCanvasFn(width, height)
    const outputContext = outputCanvas.getContext('2d')
    if (!outputContext) {
      throw new Error('Failed to create 2D canvas context')
    }
    outputContext.drawImage(sourceCanvas, 0, 0, width, height)
  }

  let blob: Blob
  try {
    const preview = await outputCanvas.convertToBlob({
      quality: WebpQuality,
      type: WebpMimeType,
    })
    if (preview.type === WebpMimeType || preview.type === PngMimeType) {
      blob = preview
    } else {
      blob = await encodePng(outputCanvas)
    }
  } catch {
    // WebP encoding is optional. Browser-native PNG remains available as a fallback.
    blob = await encodePng(outputCanvas)
  }
  return {
    blob,
    height,
    originalHeight: image.height,
    originalWidth: image.width,
    width,
  }
}

export const encodeImageToPreview = async (image: Readonly<DecodedImage>, tier: ImageTier): Promise<EncodedImage> => {
  return encodeImageToPreviewWithDependencies(image, tier, createCanvas, createImageData)
}
