import * as HID from 'node-hid'
import usbDetection from 'usb-detection'
import { DeviceDriver, DeviceDriverEvents } from './Driver'
import { ExtendableEmitter } from '../util/ExtendableStrictEmitter'
import { DeviceEvents, Device, DeviceConfiguration, DeviceProperties } from './Device'

const VENDOR_ID = 0x03eb
const PRODUCT_ID = 0x204f

export class Teensy2Device extends ExtendableEmitter<DeviceEvents>() implements Device {
  private device: HID.HID
  private onClose: () => void

  id: string

  // TODO: ask from device
  properties: DeviceProperties = {
    buttonCount: 8,
    sensorCount: 8
  }

  // TODO: ask from device
  configuration: DeviceConfiguration = {
    name: 'hiano padi',
    sensorThresholds: [0, 0, 0, 0, 0, 0, 0, 0]
  }

  private handleError = (e: Error) => {
    console.error(e)
    this.close()
  }

  private handleData = (data: Buffer) => {
    const sensors = new Array<number>(this.properties.sensorCount)
    const buttons = new Array<boolean>(this.properties.buttonCount)

    for (let i = 0; i < 12; i++) {
      sensors[i] = data.readUInt16LE(i * 2 + 1)
    }

    // TODO: calculate button state
    buttons.fill(false)

    this.emit('inputData', { sensors, buttons })
  }

  public constructor(path: string, device: HID.HID, onClose: () => void) {
    super()
    this.device = device
    this.onClose = onClose
    this.id = 'teensy-2-device-' + path
    this.device.on('error', this.handleError)
    this.device.on('data', this.handleData)
  }

  public setConfiguration() {
    /* todo */
  }

  close() {
    this.onClose()
    this.device.close()
    this.emit('disconnect')
  }
}

export class Teensy2DeviceDriver extends ExtendableEmitter<DeviceDriverEvents>()
  implements DeviceDriver {
  private knownDevicePaths = new Set<string>()

  private connectDevice = (devicePath: string) => {
    this.knownDevicePaths.add(devicePath)

    try {
      const hidDevice = new HID.HID(devicePath)
      const handleClose = () => this.knownDevicePaths.delete(devicePath)
      const newDevice = new Teensy2Device(devicePath, hidDevice, handleClose)
      this.emit('newDevice', newDevice)
    } catch (e) {
      this.knownDevicePaths.delete(devicePath)
      console.error('Could not connect to a new device')
      console.error(e)
    }
  }

  private checkForNewDevices() {
    HID.devices().forEach(device => {
      // only known devices
      if (device.productId !== PRODUCT_ID || device.vendorId !== VENDOR_ID) {
        return
      }

      const devicePath = device.path

      // this device doesn't have path, so we cannot know whether it's a new one or not. bail out.
      if (!devicePath) {
        console.error('New device was detected, but no device path was returned')
        return
      }

      // this device we know of already. bail out.
      if (this.knownDevicePaths.has(devicePath)) {
        return
      }

      // Linux needs a while from plugging the device in to be able to use it with hidraw. Thus,
      // let's wait for a while! Windows doesn't seem to have the same problem, but certainly no
      // one is in such a hurry they can't wait a second, right?
      setTimeout(() => this.connectDevice(devicePath), 1000)
    })
  }

  start() {
    this.knownDevicePaths.clear()

    // first connect to whatever devices are connected to computer now
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
