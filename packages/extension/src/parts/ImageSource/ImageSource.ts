export type ImageTier = 'full' | 'preview'

export interface ConvertedImage {
  readonly blob: Blob
  readonly height: number
  readonly originalHeight: number
  readonly originalWidth: number
  readonly width: number
}

export interface ImageSource {
  readonly height: number
  readonly isFullResolution: boolean
  readonly originalHeight: number
  readonly originalWidth: number
  readonly owned: boolean
  readonly tier: ImageTier
  readonly url: string
  readonly width: number
}
