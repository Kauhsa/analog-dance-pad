import StrictEventEmitter from 'strict-event-emitter-types'
import { EventEmitter } from 'events'

export interface DeviceInputData {
  sensors: number[]
  buttons: boolean[]
}

export interface DeviceEvents {
  inputData: DeviceInputData
  disconnect: void
}

export interface DeviceConfiguration {
  sensorThresholds: number[]
  name: string
}

export interface DeviceProperties {
  buttonCount: number
  sensorCount: number
}

export interface Device extends StrictEventEmitter<EventEmitter, DeviceEvents> {
  id: string
  properties: DeviceProperties
  configuration: DeviceConfiguration
  setConfiguration: (conf: DeviceConfiguration) => void
  close: () => void
}
