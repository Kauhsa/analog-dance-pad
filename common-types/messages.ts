import { DeviceConfiguration, DeviceDescription, DeviceInputData } from './device'

// from server

export type DevicesUpdatedEvent = {
  devices: DeviceDescription[]
}

export type EventRateEvent = {
  deviceId: string
  eventRate: number
}

export type DeviceInputEvent = {
  deviceId: string
  inputData: DeviceInputData
}

// from client

export type UpdateConfigurationEvent = {
  deviceId: string
  configuration: DeviceConfiguration
}

export type SubscribeToDeviceEvent = {
  deviceId: string
}

export type UnsubscribeFromDeviceEvent = {
  deviceId: string
}

export type SaveConfigurationEvent = {
  deviceId: string
}
