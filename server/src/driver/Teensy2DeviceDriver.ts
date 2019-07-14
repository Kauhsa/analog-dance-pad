import * as HID from 'node-hid'
import usbDetection from 'usb-detection'
import { DeviceDriver, DeviceDriverEvents } from './Driver'
import { EventEmitter } from 'events'
import StrictEventEmitter from 'strict-event-emitter-types/types/src'
import { ExtendableEmitter } from '../util/ExtendableStrictEmitter'
import { DeviceEvents, Device } from './Device'

const VENDOR_ID = 0x03eb
const PRODUCT_ID = 0x204f

export class Teensy2Device extends ExtendableEmitter<DeviceEvents>() implements Device {
  private device: HID.HID

  // todo
  id: any
  properties: any
  setConfiguration: any

  public constructor(device: HID.HID, onError: () => void) {
    super()
    this.device = device

    this.device.on('error', e => {
      this.device.close()
      onError()
      console.error(e)
    })

    this.device.on('data', () => undefined)
  }

  close() {
    this.device.close()
  }
}

export class Teensy2DeviceDriver extends ExtendableEmitter<DeviceDriverEvents>()
  implements DeviceDriver {
  private knownDevicePaths = new Set<string>()

  private checkForNewDevices() {
    const devices = HID.devices()

    for (const device of devices) {
      // only known devices
      if (device.productId !== PRODUCT_ID || device.vendorId !== VENDOR_ID) {
        return
      }

      const devicePath = device.path

      // this device doesn't have path, so we cannot know whether it's a new one or now. bail out.
      if (!devicePath) {
        return
      }

      // this device already exists
      if (this.knownDevicePaths.has(devicePath)) {
        return
      }

      this.knownDevicePaths.add(devicePath)

      const newDevice = new Teensy2Device(new HID.HID(devicePath), () =>
        this.knownDevicePaths.delete(devicePath)
      )

      this.emit('newDevice', newDevice)
    }
  }

  start() {
    this.knownDevicePaths.clear()

    // first emit whatever devices are connected now
    this.checkForNewDevices()

    // ...and then start monitoring for future changes
    usbDetection.on('add', (device: { vendorId: number; productId: number }) => {
      if (device.vendorId === VENDOR_ID && device.productId === PRODUCT_ID) {
        this.checkForNewDevices()
      }
    })

    usbDetection.startMonitoring()
  }

  close() {
    usbDetection.stopMonitoring()
  }
}
