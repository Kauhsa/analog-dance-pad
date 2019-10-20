import consola from 'consola'

import { Device, DeviceInputData, DeviceConfiguration, DeviceProperties } from './driver/Device'
import { DeviceDriver } from './driver/Driver'

const SECOND_AS_NS = BigInt(1e9)
const INPUT_EVENT_SEND_NS = SECOND_AS_NS / BigInt(60) // 60hz

interface Params {
  expressApplication: Express.Application
  socketIOServer: SocketIO.Server
  deviceDrivers: DeviceDriver[]
}

// from server

type DevicesUpdatedEvent = {
  devices: Array<{
    id: string
    configuration: DeviceConfiguration
    properties: DeviceProperties
  }>
}

type EventRateEvent = {
  deviceId: string
  eventRate: number
}

// from client

type UpdateConfigurationEvent = {
  deviceId: string
  configuration: DeviceConfiguration
}

type SubscribeToDeviceEvent = {
  deviceId: string
}

type UnsubscribeFromDeviceEvent = {
  deviceId: string
}

type SaveConfigurationEvent = {
  deviceId: string
}

const createServer = (params: Params) => {
  const lastInputEventSentByDevice: Record<string, bigint> = {}
  const devices: Record<string, Device> = {}

  /* Handlers */

  const getDevicesUpdatedEvent = (): DevicesUpdatedEvent => ({
    devices: Object.values(devices).map(({ id, configuration, properties }) => ({
      id,
      configuration,
      properties
    }))
  })

  const broadcastDevicesUpdated = () => {
    params.socketIOServer.emit('devicesUpdated', getDevicesUpdatedEvent())
  }

  const handleNewDevice = (device: Device) => {
    devices[device.id] = device
    device.on('disconnect', () => handleDisconnectDevice(device))
    device.on('inputData', data => handleInputData(device, data))
    device.on('eventRate', number => handleEventRate(device, number))
    broadcastDevicesUpdated()
    consola.info(`Connected to a new device id "${device.id}"`, {
      properties: device.properties,
      configuration: device.configuration
    })
  }

  const handleDisconnectDevice = (device: Device) => {
    delete devices[device.id]
    broadcastDevicesUpdated()
    consola.info(`Disconnected from device id "${device.id}"`)
  }

  const handleInputData = (device: Device, inputData: DeviceInputData) => {
    const lastInputEventSent = lastInputEventSentByDevice[device.id]
    const now = process.hrtime.bigint()

    // send input events only at specified rate – not at every event
    if (lastInputEventSent !== undefined && lastInputEventSent + INPUT_EVENT_SEND_NS > now) {
      return
    }

    params.socketIOServer.to(device.id).emit('inputEvent', { deviceId: device.id, inputData })
    lastInputEventSentByDevice[device.id] = now
  }

  const handleEventRate = (device: Device, rate: number) => {
    params.socketIOServer.to(device.id).emit('eventRate', { deviceId: device.id, eventRate: rate })
    consola.info(`Event rate with device "${device.id}" is ${rate}`)
  }

  /* Start server. */

  params.deviceDrivers.forEach(dd => {
    dd.on('newDevice', handleNewDevice)
    dd.start()
  })

  params.socketIOServer.on('connection', socket => {
    consola.info('New SocketIO connection from', socket.handshake.address)
    socket.emit('devicesUpdated', getDevicesUpdatedEvent())

    socket.on('subscribeToDevice', (data: SubscribeToDeviceEvent) => {
      consola.info(`Socket "${socket.handshake.address}" subscribed to device "${data.deviceId}"`)
      socket.join(data.deviceId)
    })

    socket.on('unsubsribeFromDevice', (data: UnsubscribeFromDeviceEvent) => {
      consola.info(
        `Socket "${socket.handshake.address}" unsubscribed from device "${data.deviceId}"`
      )
      socket.leave(data.deviceId)
    })

    socket.on('updateConfiguration', (data: UpdateConfigurationEvent) => {
      devices[data.deviceId].updateConfiguration(data.configuration)
      broadcastDevicesUpdated()
      consola.info(`Device id "${data.deviceId}" configuration updated`, data.configuration)
    })

    socket.on('saveConfiguration', (data: SaveConfigurationEvent) => {
      devices[data.deviceId].saveConfiguration()
    })

    socket.on('disconnect', () => {
      consola.info('Disconnected SocketIO from', socket.handshake.address)
    })
  })

  /* Return function to close server resources. */

  return () => {
    params.deviceDrivers.forEach(dd => dd.close())
  }
}

export default createServer
