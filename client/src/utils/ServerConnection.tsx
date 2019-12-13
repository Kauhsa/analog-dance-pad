import io from 'socket.io-client'

import { ServerEvents, ClientEvents } from '../../../common-types/events'

import {
  DeviceConfiguration,
  DeviceInputData,
  DeviceDescriptionMap
} from '../../../common-types/device'

import SubscriptionManager from './SubscriptionManager'

interface ServerConnectionSettings {
  address: string
  onConnect: () => void
  onDisconnect: () => void
  onDevicesUpdated: (devices: DeviceDescriptionMap) => void
}

class ServerConnection {
  private ioSocket: SocketIOClient.Socket
  private inputEventSubscriptions: SubscriptionManager<DeviceInputData>
  private rateEventSubscriptions: SubscriptionManager<number>

  constructor(settings: ServerConnectionSettings) {
    this.inputEventSubscriptions = new SubscriptionManager()
    this.rateEventSubscriptions = new SubscriptionManager()

    this.ioSocket = io(settings.address, {
      transports: ['websocket'],
      reconnectionDelay: 250,
      reconnectionDelayMax: 1000
    })
    this.ioSocket.on('connect', settings.onConnect)
    this.ioSocket.on('disconnect', settings.onDisconnect)
    this.ioSocket.on('devicesUpdated', (event: ServerEvents.DevicesUpdated) =>
      settings.onDevicesUpdated(event.devices)
    )
    this.ioSocket.on('inputEvent', this.handleInputEvent)
    this.ioSocket.on('eventRate', this.handleRateEvent)
  }

  private handleInputEvent = (event: ServerEvents.InputEvent) => {
    this.inputEventSubscriptions.emit(event.deviceId, event.inputData)
  }

  private handleRateEvent = (event: ServerEvents.EventRate) => {
    this.rateEventSubscriptions.emit(event.deviceId, event.eventRate)
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

  private hasAnySubscriptionsForDevice = (deviceId: string) => {
    return (
      this.inputEventSubscriptions.hasSubscriptionsFor(deviceId) ||
      this.rateEventSubscriptions.hasSubscriptionsFor(deviceId)
    )
  }

  public subscribeToInputEvents = (
    deviceId: string,
    callback: (data: DeviceInputData) => void
  ) => {
    if (!this.hasAnySubscriptionsForDevice(deviceId)) {
      this.subscribeToDevice(deviceId)
    }

    this.inputEventSubscriptions.subscribe(deviceId, callback)

    return () => {
      this.inputEventSubscriptions.unsubscribe(deviceId, callback)
      if (!this.hasAnySubscriptionsForDevice(deviceId)) {
        this.unsubscribeFromDevice(deviceId)
      }
    }
  }

  public subscribeToRateEvents = (
    deviceId: string,
    callback: (rate: number) => void
  ) => {
    if (!this.hasAnySubscriptionsForDevice(deviceId)) {
      this.subscribeToDevice(deviceId)
    }

    this.rateEventSubscriptions.subscribe(deviceId, callback)

    return () => {
      this.rateEventSubscriptions.unsubscribe(deviceId, callback)
      if (!this.hasAnySubscriptionsForDevice(deviceId)) {
        this.unsubscribeFromDevice(deviceId)
      }
    }
  }

  public updateConfiguration = (
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

  public updateSensorThreshold = (
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

  public calibrate = (deviceId: string, calibrationBuffer: number) => {
    const event: ClientEvents.Calibrate = {
      deviceId,
      calibrationBuffer
    }

    this.ioSocket.emit('calibrate', event)
  }
}

export default ServerConnection
