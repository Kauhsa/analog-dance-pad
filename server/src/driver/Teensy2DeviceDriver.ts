import * as HID from 'node-hid'
import usbDetection from 'usb-detection'
import { Parser } from 'binary-parser'

import { DeviceDriver, DeviceDriverEvents } from './Driver'
import { ExtendableEmitter } from '../util/ExtendableStrictEmitter'
import { DeviceEvents, Device, DeviceConfiguration, DeviceProperties } from './Device'

const VENDOR_ID = 0x03eb
const PRODUCT_ID = 0x204f

const INPUT_REPORT_ID = 0x01
const OUTPUT_REPORT_ID = 0x02

const OUTPUT_REPORT_TYPE_REQUEST_FOR_CONFIG = 0x01
const OUTPUT_REPORT_TYPE_SET_NEW_CONFIGURATION = 0x02

const INPUT_REPORT_TYPE_SENSOR_VALUES = 0x01
const INPUT_REPORT_TYPE_CURRENT_CONFIGURATION = 0x02

// in future version, I'd like to microcontroller tell this information
const SENSOR_COUNT = 12
const BUTTON_COUNT = 16

const promisifiedHIDRead = (device: HID.HID): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    try {
      device.read((err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve((data as unknown) as Buffer)
        }
      })
    } catch (e) {
      reject(e)
    }
  })

export class Teensy2Device extends ExtendableEmitter<DeviceEvents>() implements Device {
  private device: HID.HID
  private onClose: () => void

  id: string

  properties: DeviceProperties = {
    buttonCount: BUTTON_COUNT,
    sensorCount: SENSOR_COUNT
  }

  // TODO: ask from device
  configuration: DeviceConfiguration = {
    sensorThresholds: [0, 0, 0, 0, 0, 0, 0, 0]
  }

  static async fromDevicePath(devicePath: string, onClose: () => void): Promise<Teensy2Device> {
    const hidDevice = new HID.HID(devicePath)

    // write a configuration read request
    hidDevice.write([OUTPUT_REPORT_ID, OUTPUT_REPORT_TYPE_REQUEST_FOR_CONFIG])

    // try to read configuration. 100 attempts should be plenty.
    for (let i = 0; i < 100; i++) {
      const data = await promisifiedHIDRead(hidDevice)
      const reportType = data.readUInt8(3)

      if (reportType === INPUT_REPORT_TYPE_CURRENT_CONFIGURATION) {
        return new Teensy2Device(devicePath, hidDevice, onClose)
      }
    }

    throw new Error(
      `Found a compatible HID device in ${devicePath}, but it didn't return configuration upon asking`
    )
  }

  private constructor(path: string, device: HID.HID, onClose: () => void) {
    super()
    this.device = device
    this.onClose = onClose
    this.id = 'teensy-2-device-' + path
    this.device.on('error', this.handleError)
    this.device.on('data', this.handleData)
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

  private connectDevice = async (devicePath: string) => {
    this.knownDevicePaths.add(devicePath)

    try {
      const handleClose = () => this.knownDevicePaths.delete(devicePath)
      const newDevice = await Teensy2Device.fromDevicePath(devicePath, handleClose)
      this.emit('newDevice', newDevice)
    } catch (e) {
      this.knownDevicePaths.delete(devicePath)
      console.error('Could not connect to a new device - ', e)
    }
  }

  private connectToNewDevices() {
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
    this.connectToNewDevices()

    // ...and then start monitoring for future changes
    usbDetection.on('add', (device: { vendorId: number; productId: number }) => {
      if (device.vendorId === VENDOR_ID && device.productId === PRODUCT_ID) {
        this.connectToNewDevices()
      }
    })
    usbDetection.startMonitoring()
  }

  close() {
    usbDetection.stopMonitoring()
  }
}
