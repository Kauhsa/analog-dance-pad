import { DeviceConfiguration, DeviceDescription } from './device'

// from server

export type DevicesUpdatedEvent = {
  devices: DeviceDescription[]
}

export type EventRateEvent = {
  deviceId: string
  eventRate: number
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
