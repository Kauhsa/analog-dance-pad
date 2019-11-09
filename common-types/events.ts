import { DeviceConfiguration, DeviceDescription, DeviceInputData } from './device'

// events from server
export namespace ServerEvents {
  // from server
  export type DevicesUpdated = {
    devices: DeviceDescription[]
  }

  export type EventRate = {
    deviceId: string
    eventRate: number
  }

  export type InputEvent = {
    deviceId: string
    inputData: DeviceInputData
  }
}

// from client
export namespace ClientEvents {
  export const enum Names {
  }

  export type UpdateConfiguration = {
    deviceId: string
    configuration: Partial<DeviceConfiguration>
  }

  export type SubscribeToDevice = {
    deviceId: string
  }

  export type UnsubscribeFromDevice = {
    deviceId: string
  }

  export type SaveConfiguration = {
    deviceId: string
  }

  export type UpdateSensorThreshold = {
    deviceId: string
    sensorIndex: number,
    newThreshold: number
  }

  export type StartOrUpdateCalibration = {
    deviceId: string,
    calibrationBuffer: number
  }

  export type CancelCalibration = {
    deviceId: string
  }

  export type SaveCalibration = {
    deviceId: string
  }
} 
