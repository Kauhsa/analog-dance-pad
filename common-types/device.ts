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

export interface DeviceDescription {
  id: string
  configuration: DeviceConfiguration
  properties: DeviceProperties
}

export interface DeviceInputData {
  sensors: number[]
  buttons: boolean[]
}

export type DeviceDescriptionMap = { [deviceId: string]: DeviceDescription }