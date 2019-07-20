import { Router, Request } from 'express'
import * as WebSocket from 'ws'
import consola from 'consola'

import { Device, DeviceInputData, DeviceConfiguration, DeviceProperties } from './driver/Device'
import { DeviceDriver } from './driver/Driver'

const SECOND_AS_NS = BigInt(1e9)
const INPUT_EVENT_SEND_NS = SECOND_AS_NS / BigInt(60) // 60hz

interface Settings {
  deviceDrivers: DeviceDriver[]
}

type InputMessage =
  | {
      type: 'subscribeToDevice'
      deviceId: string
    }
  | { type: 'unsubscribeFromDevice'; deviceId: string }
  | { type: 'updateConfiguration'; deviceId: string; configuration: DeviceConfiguration }

type OutputMessage =
  | {
      type: 'inputEvent'
      deviceId: string
      inputData: DeviceInputData
    }
  | {
      type: 'devicesUpdated'
      devices: Array<{
        id: string
        configuration: DeviceConfiguration
        properties: DeviceProperties
      }>
    }
  | {
      type: 'eventRate'
      deviceId: string
      eventRate: number
    }

type ExtendedWebSocket = WebSocket & {
  subscribedDevices: Set<string>
}

export class Server {
  settings: Settings
  devices: Record<string, Device> = {}
  webSockets: Set<ExtendedWebSocket>
  lastInputEventSent: Record<string, bigint>

  constructor(settings: Settings) {
    this.settings = settings
    this.devices = {}
    this.webSockets = new Set()
    this.lastInputEventSent = {}
  }

  private serializeMessage = (obj: OutputMessage) => JSON.stringify(obj)

  private sendToClient(ws: WebSocket, obj: OutputMessage) {
    ws.send(this.serializeMessage(obj))
  }

  private sendToAllClients(obj: OutputMessage) {
    const msg = this.serializeMessage(obj)
    this.webSockets.forEach(ws => ws.send(msg))
  }

  private sendToSubscribedDevices(device: Device, obj: OutputMessage) {
    const msg = this.serializeMessage(obj)

    for (const socket of this.webSockets) {
      if (socket.subscribedDevices.has(device.id)) {
        socket.send(msg)
      }
    }
  }

  private getDevicesUpdatedMessage = () => ({
    type: 'devicesUpdated' as const,
    devices: Object.values(this.devices).map(({ id, configuration, properties }) => ({
      id,
      configuration,
      properties
    }))
  })

  private handleNewDevice = (device: Device) => {
    this.devices[device.id] = device
    device.on('disconnect', () => this.handleDisconnectDevice(device))
    device.on('inputData', data => this.handleInputData(device, data))
    device.on('eventRate', number => this.handleEventRate(device, number))
    this.sendToAllClients(this.getDevicesUpdatedMessage())
    consola.info(`Connected to a new device id "${device.id}"`, {
      properties: device.properties,
      configuration: device.configuration
    })
  }

  private handleDisconnectDevice = (device: Device) => {
    delete this.devices[device.id]
    this.sendToAllClients(this.getDevicesUpdatedMessage())
    consola.info(`Disconnected from device id "${device.id}"`)
  }

  private handleInputData = (device: Device, inputData: DeviceInputData) => {
    const lastInputEventSent = this.lastInputEventSent[device.id]
    const now = process.hrtime.bigint()

    // send input events only at specified rate – not at every event
    if (lastInputEventSent !== undefined && lastInputEventSent + INPUT_EVENT_SEND_NS > now) {
      return
    }

    this.sendToSubscribedDevices(device, { type: 'inputEvent', deviceId: device.id, inputData })
    this.lastInputEventSent[device.id] = now
  }

  private handleEventRate = (device: Device, rate: number) => {
    this.sendToSubscribedDevices(device, {
      type: 'eventRate',
      deviceId: device.id,
      eventRate: rate
    })
  }

  private handleSocketMessage = (
    ws: ExtendedWebSocket,
    remoteAddress: string | undefined,
    data: WebSocket.Data
  ) => {
    try {
      const msg: InputMessage = JSON.parse(data.toString('utf-8'))

      if (msg.type === 'subscribeToDevice') {
        ws.subscribedDevices.add(msg.deviceId)
        consola.info(
          `Websocket connection from "${remoteAddress}" subscribed to device id "${msg.deviceId}"`
        )
      } else if (msg.type === 'unsubscribeFromDevice') {
        ws.subscribedDevices.delete(msg.deviceId)
        consola.info(
          `Websocket connection from "${remoteAddress}" unsubscribed from device id "${msg.deviceId}`
        )
      } else if (msg.type === 'updateConfiguration') {
        this.devices[msg.deviceId].setConfiguration(msg.configuration)
        this.sendToAllClients(this.getDevicesUpdatedMessage())
        consola.info(`Device id ${msg.deviceId} configuration updated`, msg.configuration)
      } else {
        consola.warn(
          `Received websocket message from "${remoteAddress}" that was not understood`,
          data
        )
      }
    } catch (e) {
      consola.error('Error while parsing websocket message:', e)
    }
  }

  private handleNewSocket = (ws: WebSocket, req: Request) => {
    const remoteAddress = req.connection.remoteAddress

    const extendedSocket: ExtendedWebSocket = Object.assign(ws, {
      subscribedDevices: new Set<string>()
    })

    // add socket to websocket list
    extendedSocket.on('message', data =>
      this.handleSocketMessage(extendedSocket, remoteAddress, data)
    )
    extendedSocket.on('close', () => this.handleDisconnectSocket(extendedSocket, remoteAddress))
    this.webSockets.add(extendedSocket)

    // send initial server state to a new client
    this.sendToClient(extendedSocket, this.getDevicesUpdatedMessage())

    consola.info('New websocket connection from', remoteAddress)
  }

  private handleDisconnectSocket = (ws: ExtendedWebSocket, remoteAddress: string | undefined) => {
    this.webSockets.delete(ws)
    consola.info('Disconnected websocket connection from', remoteAddress)
  }

  start(): Router {
    this.settings.deviceDrivers.forEach(dd => {
      dd.on('newDevice', this.handleNewDevice)
      dd.start()
    })

    const router = Router()
    router.ws('/socket', this.handleNewSocket)
    return router
  }

  close() {
    this.settings.deviceDrivers.forEach(dd => dd.close())
  }
}
