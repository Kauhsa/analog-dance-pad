import io from 'socket.io-client'
import { pull } from 'lodash-es'

import { ServerEvents, ClientEvents } from '../../../common-types/events'

import {
  DeviceConfiguration,
  DeviceDescription,
  DeviceInputData
} from '../../../common-types/device'

interface ServerConnectionSettings {
  address: string
  onConnect: () => void
  onDisconnect: () => void
  onDevicesUpdated: (event: DeviceDescription[]) => void
}

class ServerConnection {
  private ioSocket: SocketIOClient.Socket

  private inputEventSubscribers: {
    [deviceId: string]: Array<(inputData: DeviceInputData) => void>
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

    for (const subscriber of currentSubscribers) {
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
      this.inputEventSubscribers[deviceId] = [callback]
    } else {
      // if there are other subscriptions, just push the callback to list
      this.inputEventSubscribers[deviceId].push(callback)
    }

    // unsubscription function
    return () => {
      if (this.inputEventSubscribers[deviceId] === undefined) {
        return
      }

      // remove callback from subscribers
      pull(this.inputEventSubscribers[deviceId], callback)

      // if this was last subscriber, unsubscribe and remove the whole subscriber list
      if (this.inputEventSubscribers[deviceId].length === 0) {
        this.unsubscribeFromDevice(deviceId)
        delete this.inputEventSubscribers[deviceId]
      }
    }
  }

  updateConfiguration = (
    deviceId: string,
    configuration: Partial<DeviceConfiguration>
  ) => {
    const event: ClientEvents.UpdateConfiguration = {
      deviceId,
      configuration
    }

    this.ioSocket.emit('updateConfiguration', event)
  }

  updateSensorThreshold = (
    deviceId: string,
    sensorIndex: number,
    newThreshold: number
  ) => {
    const event: ClientEvents.UpdateSensorThreshold = {
      deviceId,
      sensorIndex,
      newThreshold
    }

    this.ioSocket.emit('updateSensorThreshold', event)
  }

  startOrUpdateCalibration = (deviceId: string, calibrationBuffer: number) => {
    const event: ClientEvents.StartOrUpdateCalibration = {
      deviceId,
      calibrationBuffer
    }

    this.ioSocket.emit('startOrUpdateCalibration', event)
  }

  saveCalibration = (deviceId: string) => {
    const event: ClientEvents.SaveCalibration = {
      deviceId
    }

    this.ioSocket.emit('saveCalibration', event)
  }

  cancelCalibration = (deviceId: string) => {
    const event: ClientEvents.CancelCalibration = {
      deviceId
    }

    this.ioSocket.emit('cancelCalibration', event)
  }
}

export default ServerConnection
