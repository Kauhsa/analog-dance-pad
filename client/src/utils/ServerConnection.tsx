import io from 'socket.io-client'

import { ServerEvents, ClientEvents } from '../../../common-types/events'

import {
  DeviceConfiguration,
  DeviceInputData,
  DeviceDescriptionMap
} from '../../../common-types/device'

interface ServerConnectionSettings {
  address: string
  onConnect: () => void
  onDisconnect: () => void
  onDevicesUpdated: (devices: DeviceDescriptionMap) => void
}

class ServerConnection {
  private ioSocket: SocketIOClient.Socket

  private inputEventSubscribers: {
    [deviceId: string]: Set<(inputData: DeviceInputData) => void>
  }

  constructor(settings: ServerConnectionSettings) {
    this.inputEventSubscribers = {}

    this.ioSocket = io(settings.address, {
      transports: ['websocket']
    })
    this.ioSocket.on('connect', settings.onConnect)
    this.ioSocket.on('disconnect', settings.onDisconnect)
    this.ioSocket.on('devicesUpdated', (event: ServerEvents.DevicesUpdated) =>
      settings.onDevicesUpdated(event.devices)
    )
    this.ioSocket.on('inputEvent', this.handleInputEvent)
  }

  private handleInputEvent = (event: ServerEvents.InputEvent) => {
    const currentSubscribers = this.inputEventSubscribers[event.deviceId]

    if (!currentSubscribers) {
      return
    }

    for (const subscriber of currentSubscribers.values()) {
      subscriber(event.inputData)
    }
  }

  private subscribeToDevice = (deviceId: string) => {
    const event: ClientEvents.SubscribeToDevice = { deviceId }
    this.ioSocket.emit('subscribeToDevice', event)
  }

  private unsubscribeFromDevice = (deviceId: string) => {
    const event: ClientEvents.UnsubscribeFromDevice = {
      deviceId
    }
    this.ioSocket.emit('unsubscribeFromDevice', event)
  }

  subscribeToInputEvents = (
    deviceId: string,
    callback: (data: DeviceInputData) => void
  ) => {
    if (this.inputEventSubscribers[deviceId] === undefined) {
      // if there are no other subscribers for this device, subscribe to events
      this.subscribeToDevice(deviceId)
      this.inputEventSubscribers[deviceId] = new Set([callback])
    } else {
      // if there are other subscriptions, just push the callback to list
      this.inputEventSubscribers[deviceId].add(callback)
    }

    // unsubscription function
    return () => {
      if (this.inputEventSubscribers[deviceId] === undefined) {
        return
      }

      // remove callback from subscribers
      this.inputEventSubscribers[deviceId].delete(callback)

      // if this was last subscriber, unsubscribe and remove the whole subscriber list
      if (this.inputEventSubscribers[deviceId].size === 0) {
        this.unsubscribeFromDevice(deviceId)
        delete this.inputEventSubscribers[deviceId]
      }
    }
  }

  updateConfiguration = (
    deviceId: string,
    configuration: Partial<DeviceConfiguration>,
    store: boolean
  ) => {
    const event: ClientEvents.UpdateConfiguration = {
      deviceId,
      configuration,
      store
    }

    this.ioSocket.emit('updateConfiguration', event)
  }

  updateSensorThreshold = (
    deviceId: string,
    sensorIndex: number,
    newThreshold: number,
    store: boolean
  ) => {
    const event: ClientEvents.UpdateSensorThreshold = {
      deviceId,
      sensorIndex,
      newThreshold,
      store
    }

    this.ioSocket.emit('updateSensorThreshold', event)
  }

  calibrate = (deviceId: string, calibrationBuffer: number) => {
    const event: ClientEvents.Calibrate = {
      deviceId,
      calibrationBuffer
    }

    this.ioSocket.emit('calibrate', event)
  }
}

export default ServerConnection
