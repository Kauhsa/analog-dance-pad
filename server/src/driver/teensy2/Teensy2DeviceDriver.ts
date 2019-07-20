import * as HID from 'node-hid'
import usbDetection from 'usb-detection'

import { DeviceDriver, DeviceDriverEvents } from '../Driver'
import { DeviceEvents, Device, DeviceConfiguration, DeviceProperties } from '../Device'
import { createInputReportParser, InputReportExtraDataType } from './Teensy2InputReportParser'
import { createOutputReportWriter } from './Teensy2OutputReportWriter'
import { ExtendableEmitter } from '../../util/ExtendableStrictEmitter'

const VENDOR_ID = 0x03eb
const PRODUCT_ID = 0x204f

// in future version, I'd like to device to tell this information
const SENSOR_COUNT = 12
const BUTTON_COUNT = 16

const parseInputReport = createInputReportParser(BUTTON_COUNT, SENSOR_COUNT)
const outputReportWriter = createOutputReportWriter(BUTTON_COUNT, SENSOR_COUNT)

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
  private eventsSinceLastUpdate: number
  private eventRateInterval: NodeJS.Timeout

  id: string

  properties: DeviceProperties = {
    buttonCount: BUTTON_COUNT,
    sensorCount: SENSOR_COUNT
  }

  configuration: DeviceConfiguration

  static async fromDevicePath(devicePath: string, onClose: () => void): Promise<Teensy2Device> {
    const hidDevice = new HID.HID(devicePath)

    try {
      // write a configuration read request
      hidDevice.write(outputReportWriter.requestForConfiguration())

      // try to read configuration. 100 attempts should be plenty.
      // TODO: this needs some kind of timeout, nothing guarantees there will even be 100 reports
      // to read.
      for (let i = 0; i < 5; i++) {
        const data = await promisifiedHIDRead(hidDevice)
        const parsedReport = parseInputReport(data)

        if (parsedReport.extraData.type === InputReportExtraDataType.CURRENT_CONFIGURATION) {
          const configuration: DeviceConfiguration = {
            sensorThresholds: parsedReport.extraData.sensorThresholds,
            releaseThreshold: parsedReport.extraData.releaseThreshold
          }
          return new Teensy2Device(devicePath, configuration, hidDevice, onClose)
        }
      }

      throw new Error(
        `Found a compatible HID device in ${devicePath}, but it didn't return configuration upon asking`
      )
    } catch (e) {
      hidDevice.close()
      throw e
    }
  }

  private constructor(
    path: string,
    configuration: DeviceConfiguration,
    device: HID.HID,
    onClose: () => void
  ) {
    super()
    this.id = 'teensy-2-device-' + path
    this.configuration = configuration
    this.device = device
    this.onClose = onClose
    this.device.on('error', this.handleError)
    this.device.on('data', this.handleData)

    // initialize event rate tracking
    this.eventRateInterval = setInterval(this.handleEventRateMeasurement, 1000)
    this.eventsSinceLastUpdate = 0
  }

  private handleError = (e: Error) => {
    console.error(e)
    this.close()
  }

  private handleData = (data: Buffer) => {
    this.eventsSinceLastUpdate++
    const inputReport = parseInputReport(data)

    if (inputReport.extraData.type === InputReportExtraDataType.SENSOR_VALUES) {
      this.emit('inputData', {
        sensors: inputReport.extraData.sensorValues,
        buttons: inputReport.buttons
      })
    }
  }

  private handleEventRateMeasurement = () => {
    this.emit('eventRate', this.eventsSinceLastUpdate)
    this.eventsSinceLastUpdate = 0
  }

  public setConfiguration(configuration: DeviceConfiguration) {
    this.device.write(outputReportWriter.setNewConfiguration(configuration))
  }

  close() {
    clearInterval(this.eventRateInterval)
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
