import StrictEventEmitter from 'strict-event-emitter-types'
import { EventEmitter } from 'events'
import { Device } from './Device'

export interface DeviceDriverEvents {
  newDevice: Device
}

export interface DeviceDriver extends StrictEventEmitter<EventEmitter, DeviceDriverEvents> {
  start: () => void
  close: () => void
}
