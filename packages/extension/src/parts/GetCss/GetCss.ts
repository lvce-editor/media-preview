export const getCss = (domMatrixString: string): string => {
  return `.MediaPreview {
  --MediaPreviewTransform: ${domMatrixString};
}`
}
