import io from 'socket.io-client'
import {
  DevicesUpdatedEvent,
  EventRateEvent,
  InputEvent,
  UpdateConfigurationEvent,
  SubscribeToDeviceEvent,
  UnsubscribeFromDeviceEvent,
  SaveConfigurationEvent
} from './NetworkEvents'

const URL = 'http://127.0.0.1'
const PORT = 3333

export interface OnDevicesUpdated {
  (e: DevicesUpdatedEvent): void
}

export interface OnInput {
  (e: InputEvent): void
}

export interface OnEventRate {
  (e: EventRateEvent): void
}

class Connection {
  connection: SocketIOClient.Socket

  constructor(url: string, port: number) {
    this.connection = io.connect(`${url}:${port}`)
    console.log('Connection:connected', this.connection)

    this.subscribeOnDevicesUpdated((e: DevicesUpdatedEvent) => {
      console.log('Connection:devicesUpdated', e)
    })

    this.subscribeOnInputReceived((e: InputEvent) => {
      console.log('Connection:inputEvent', e)
    })

    this.subscribeOnEventRateReceived((e: EventRateEvent) => {
      console.log('Connection:devicesUpdated', e)
    })
  }

  // Server events

  subscribeOnDevicesUpdated = (cb: OnDevicesUpdated) => {
    this.connection.on('devicesUpdated', cb)
  }

  subscribeOnInputReceived = (cb: OnInput) => {
    this.connection.on('inputEvent', cb)
  }

  subscribeOnEventRateReceived = (cb: OnEventRate) => {
    this.connection.on('eventRate', cb)
  }

  // Client events

  subscribeToDevice = (e: SubscribeToDeviceEvent) => {
    console.log('Connection:', e)
    this.connection.emit('subscribeToDevice', e)
  }

  unsubsribeFromDevice = (e: UnsubscribeFromDeviceEvent) => {
    console.log('Connection:', e)
    this.connection.emit('unsubsribeFromDevice', e)
  }

  updateConfiguration = (e: UpdateConfigurationEvent) => {
    console.log('Connection:', e)
    this.connection.emit('updateConfiguration', e)
  }

  saveConfiguration = (e: SaveConfigurationEvent) => {
    console.log('Connection:', e)
    this.connection.emit('saveConfiguration', e)
  }
}

export default new Connection(URL, PORT)
