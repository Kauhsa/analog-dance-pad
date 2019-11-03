import consola from 'consola'

import * as events from '../../common-types/messages'
import { Device } from './driver/Device'
import { DeviceDriver } from './driver/Driver'
import { DeviceInputData } from '../../common-types/device'

const SECOND_AS_NS = BigInt(1e9)
const INPUT_EVENT_SEND_NS = SECOND_AS_NS / BigInt(20) // 20hz

interface Params {
  expressApplication: Express.Application
  socketIOServer: SocketIO.Server
  deviceDrivers: DeviceDriver[]
}

const createServer = (params: Params) => {
  const lastInputEventSentByDevice: Record<string, bigint> = {}
  const devices: Record<string, Device> = {}

  /* Handlers */

  const getDevicesUpdatedEvent = (): events.DevicesUpdatedEvent => ({
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

    const event: events.DeviceInputEvent = {
      deviceId: device.id,
      inputData
    }
    params.socketIOServer.volatile.to(device.id).emit('inputEvent', event)
    lastInputEventSentByDevice[device.id] = now
  }

  const handleEventRate = (device: Device, rate: number) => {
    const event: events.EventRateEvent = { deviceId: device.id, eventRate: rate }
    params.socketIOServer.to(device.id).emit('eventRate', event)
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

    socket.on('subscribeToDevice', (data: events.SubscribeToDeviceEvent) => {
      consola.info(`Socket "${socket.handshake.address}" subscribed to device "${data.deviceId}"`)
      socket.join(data.deviceId)
    })

    socket.on('unsubsribeFromDevice', (data: events.UnsubscribeFromDeviceEvent) => {
      consola.info(
        `Socket "${socket.handshake.address}" unsubscribed from device "${data.deviceId}"`
      )
      socket.leave(data.deviceId)
    })

    socket.on('updateConfiguration', async (data: events.UpdateConfigurationEvent) => {
      await devices[data.deviceId].updateConfiguration(data.configuration)
      broadcastDevicesUpdated()
      consola.info(`Device id "${data.deviceId}" configuration updated`, data.configuration)
    })

    socket.on('saveConfiguration', async (data: events.SaveConfigurationEvent) => {
      await devices[data.deviceId].saveConfiguration()
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
