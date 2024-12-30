import { id } from '../Id/Id.ts'
import * as Rpc from '../Rpc/Rpc.ts'
import * as SetSavedState from '../SetSavedState/SetSavedState.ts'
import { ImageLoadError } from '../ImageLoadError/ImageLoadError.ts'
import { WebView } from '../WebView/WebView.ts'
import * as DomMatrix from '../DomMatrix/DomMatrix.ts'
import * as PreviewStates from '../WebViewStates/WebViewStates.ts'

export const create = async ({ port, savedState, webViewId, uri }) => {
  const preview: WebView = {
    domMatrix: DomMatrix.create(),
    pointerOffsetX: 0,
    pointerOffsetY: 0,
    pointerDown: false,
    minZoom: 0.1,
    maxZoom: 2 ** 15, // max value that doesn't result in degradation
    zoomFactor: 200,
    eventCache: [],
    error: false,
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
