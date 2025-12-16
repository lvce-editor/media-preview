import type { WebView } from '../WebView/WebView.ts'
import * as DomMatrix from '../DomMatrix/DomMatrix.ts'
import { id } from '../Id/Id.ts'
import { ImageLoadError } from '../ImageLoadError/ImageLoadError.ts'
import * as Rpc from '../Rpc/Rpc.ts'
import * as SetSavedState from '../SetSavedState/SetSavedState.ts'
import * as PreviewStates from '../WebViewStates/WebViewStates.ts'

export const create = async ({ port, savedState, uri, webViewId }) => {
  const preview: WebView = {
    domMatrix: DomMatrix.create(),
    error: false,
    eventCache: [],
    maxZoom: 2 ** 15, // max value that doesn't result in degradation
    minZoom: 0.1,
    pointerDown: false,
    pointerOffsetX: 0,
    pointerOffsetY: 0,
    port,
    zoomFactor: 200,
  }
  PreviewStates.set(id, preview)
  SetSavedState.setSavedState(id, savedState)
  // TODO instead of global rpc variable, pass rpc as variable to this function
  const remoteUrl = await Rpc.invoke('WebView.getRemoteUrl', {
    uri,
    webViewId,
  })

  const event = await port.invoke('initialize', remoteUrl)
  if (event.type === 'error') {
    throw new ImageLoadError(event)
  }

  return {}
}
