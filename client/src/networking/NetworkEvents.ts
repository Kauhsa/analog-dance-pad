import { Device, DeviceConfiguration, DeviceInputData } from './Device'

// from server

export interface DevicesUpdatedEvent {
  devices: Array<Device>
}

export interface InputEvent {
  deviceId: string
  inputData: DeviceInputData
}

export interface EventRateEvent {
  deviceId: string
  eventRate: number
}

// from client

export interface UpdateConfigurationEvent {
  deviceId: string
  configuration: DeviceConfiguration
}

export interface SubscribeToDeviceEvent {
  deviceId: string
}

export interface UnsubscribeFromDeviceEvent {
  deviceId: string
}

export interface SaveConfigurationEvent {
  deviceId: string
}
