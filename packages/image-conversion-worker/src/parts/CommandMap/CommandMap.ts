import * as ConvertHeicToPng from '../ConvertHeicToPng/ConvertHeicToPng.ts'
import * as ConvertTiffToPng from '../ConvertTiffToPng/ConvertTiffToPng.ts'

export const commandMap: Readonly<Record<string, unknown>> = {
  'ImageConversion.convertHeicToPng': ConvertHeicToPng.convertHeicToPng,
  'ImageConversion.convertTiffToPng': ConvertTiffToPng.convertTiffToPng,
}
