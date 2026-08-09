import * as ConvertHeicToPng from '../ConvertHeicToPng/ConvertHeicToPng.ts'

export const commandMap: Readonly<Record<string, unknown>> = {
  'ImageConversion.convertHeicToPng': ConvertHeicToPng.convertHeicToPng,
}
