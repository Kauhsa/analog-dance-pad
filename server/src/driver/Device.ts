import StrictEventEmitter from 'strict-event-emitter-types'
import { EventEmitter } from 'events'

export interface DeviceEvents {
  sensorData: void
  disconnect: void
}

export interface DeviceConfiguration {
  sensorThresholds: number[]
  name: string
}

export interface Device extends StrictEventEmitter<EventEmitter, DeviceEvents> {
  id: string

  properties: {
    buttonCount: number
    sensorCount: number
    configuration: DeviceConfiguration
  }

  setConfiguration: (conf: DeviceConfiguration) => void
  close: () => void
}
