import * as GetOrCreateWorker from '../GetOrCreateWorker/GetOrCreateWorker.ts'
import * as LaunchMediaPreviewWorker from '../LaunchMediaPreviewWorker/LaunchMediaPreviewWorker.ts'

const { invoke } = GetOrCreateWorker.getOrCreateWorker(LaunchMediaPreviewWorker.launchMediaPreviewWorker)

export { invoke }
