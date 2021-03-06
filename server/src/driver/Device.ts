import {
  DeviceConfiguration,
  DeviceProperties,
  DeviceInputData
} from '../../../common-types/device'

import StrictEventEmitter from 'strict-event-emitter-types'
import { EventEmitter } from 'events'

export interface DeviceEvents {
  inputData: DeviceInputData
  eventRate: number
  disconnect: void
}

export interface Device extends StrictEventEmitter<EventEmitter, DeviceEvents> {
  id: string
  properties: DeviceProperties
  configuration: DeviceConfiguration
  updateConfiguration: (conf: Partial<DeviceConfiguration>) => Promise<void>
  saveConfiguration: () => Promise<void>
  close: () => void
}
