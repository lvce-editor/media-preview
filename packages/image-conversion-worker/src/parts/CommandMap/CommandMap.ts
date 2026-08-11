import * as ConvertHeicToPreview from '../ConvertHeicToPreview/ConvertHeicToPreview.ts'
import * as ConvertTiffToPng from '../ConvertTiffToPng/ConvertTiffToPng.ts'

export const commandMap: Readonly<Record<string, unknown>> = {
  'ImageConversion.convertHeicToPreview': ConvertHeicToPreview.convertHeicToPreview,
  'ImageConversion.convertTiffToPng': ConvertTiffToPng.convertTiffToPng,
}
