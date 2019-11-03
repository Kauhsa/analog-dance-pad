export interface Device {
  id: string
  configuration: DeviceConfiguration
  properties: DeviceProperties
}

export interface DeviceInputData {
  sensors: number[]
  buttons: boolean[]
}

export interface DeviceEvents {
  inputData: DeviceInputData
  eventRate: number
}

// this is information that user is excepted to reconfigure
export interface DeviceConfiguration {
  sensorThresholds: number[]
  releaseThreshold: number
  sensorToButtonMapping: number[]
}

// this is information from device that cannot be changed
export interface DeviceProperties {
  buttonCount: number
  sensorCount: number
}
