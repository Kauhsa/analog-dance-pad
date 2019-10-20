import StrictEventEmitter from 'strict-event-emitter-types'
import { EventEmitter } from 'events'

export interface DeviceInputData {
  sensors: number[]
  buttons: boolean[]
}

export interface DeviceEvents {
  inputData: DeviceInputData
  eventRate: number
  disconnect: void
}

// this is information that user is excepted to reconfigure
export interface DeviceConfiguration {
  name: string
  sensorThresholds: number[]
  releaseThreshold: number
  sensorToButtonMapping: number[]
}

// this is information from device that cannot be changed
export interface DeviceProperties {
  buttonCount: number
  sensorCount: number
}

export interface Device extends StrictEventEmitter<EventEmitter, DeviceEvents> {
  id: string
  properties: DeviceProperties
  configuration: DeviceConfiguration
  updateConfiguration: (conf: DeviceConfiguration) => Promise<void>
  saveConfiguration: () => Promise<void>
  close: () => void
}
