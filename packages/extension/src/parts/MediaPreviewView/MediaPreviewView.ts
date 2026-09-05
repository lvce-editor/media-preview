import type { InstanceView } from '@lvce-editor/api'
import type { MediaPreviewComponentState } from '../MediaPreviewViewInstance/MediaPreviewViewInstance.ts'
import { createInstance, type MediaPreviewViewInstance } from '../MediaPreviewViewInstance/MediaPreviewViewInstance.ts'

export const viewId = 'builtin.media-preview'

// The coordinate-bearing view command transports both pointer coordinates.
// The instance distinguishes these synthetic events by name.
export const view: InstanceView<MediaPreviewViewInstance, MediaPreviewComponentState> = {
  create: createInstance,
  eventListeners: [
    {
      name: 'handleMediaPreviewImageError',
      params: ['handleMediaPreviewImageError', 'event.currentTarget.dataset.sourceUrl'],
    },
    {
      name: 'handleMediaPreviewImageLoad',
      params: [
        'handleMediaPreviewImageLoad',
        'event.currentTarget.dataset.sourceUrl',
        'event.currentTarget.naturalWidth',
        'event.currentTarget.naturalHeight',
      ],
    },
    {
      name: 'handleOpenInTextEditor',
      params: ['handleOpenInTextEditor'],
      preventDefault: true,
    },
    {
      name: 'handleMediaPreviewKeyDown',
      params: ['handleMediaPreviewKeyDown', 'event.key'],
    },
    {
      name: 'handleMediaPreviewPointerDown',
      params: ['handleMediaPreviewPointerDown', 'event.button', 'event.clientX', 'event.clientY'],
      preventDefault: true,
      // The virtual DOM runtime uses this to attach move/up listeners while
      // the pointer is captured. It is intentionally runtime-only metadata.
      // @ts-ignore
      trackPointerEvents: ['handleMediaPreviewPointerMove', 'handleMediaPreviewPointerUp'],
    },
    {
      name: 'handleMediaPreviewPointerMove',
      params: ['handleMediaPreviewPointerMove', 'event.clientX', 'event.clientY'],
      preventDefault: true,
    },
    {
      name: 'handleMediaPreviewPointerUp',
      params: ['handleMediaPreviewPointerUp', 'event.clientX', 'event.clientY'],
      preventDefault: true,
    },
    {
      name: 'handleMediaPreviewWheel',
      params: [
        'handleMediaPreviewWheel',
        'event.deltaY',
        'event.deltaMode',
        'event.currentTarget.clientWidth',
        'event.currentTarget.clientHeight',
        'event.currentTarget.ownerDocument.defaultView.devicePixelRatio',
      ],
      passive: true,
    },
  ],
  getComponentState: (instance) => instance.getComponentState(),
  id: viewId,
  kind: 'virtualDom',
  setComponentState: (instance, state) => instance.setComponentState(state),
  title: 'Media Preview',
}
