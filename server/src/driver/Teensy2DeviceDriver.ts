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

// in future version, I'd like to device to tell this information
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

function getButtonFormatter(data: any) {
  const bitArray = new Array(16)

  for (let i = 0; i < 16; i++) {
    bitArray[i] = (data >> i) % 2 != 0
  }

  return bitArray
}

const sensorValueExtraDataParser = new Parser().array('sensors', {
  type: 'uint16le',
  length: SENSOR_COUNT
})

const configurationExtraDataParser = new Parser()
  .array('sensorThresholds', {
    type: 'uint16le',
    length: SENSOR_COUNT
  })
  .floatle('releaseThreshold')

const inputReportParser = new Parser()
  .uint8('reportId')
  .uint16le('buttonBits')
  .uint8('extraDataType')
  .choice('extraData', {
    tag: 'extraDataType',
    choices: {
      [INPUT_REPORT_TYPE_SENSOR_VALUES]: sensorValueExtraDataParser,
      [INPUT_REPORT_TYPE_CURRENT_CONFIGURATION]: configurationExtraDataParser
    }
  })

const createOutputReport = (data: number[]): number[] => {
  // TODO: automatically define 30 or do some other measure. Windows is happy
  // whether we send bytes of the full report length, but linux seems not to be.
  const array = new Array(30).fill(0)
  array[0] = OUTPUT_REPORT_ID
  array[1] = OUTPUT_REPORT_TYPE_REQUEST_FOR_CONFIG

  for (let i = 0; i < data.length; i++) {
    array[i + 1] = data[0]
  }

  return array
}

export class Teensy2Device extends ExtendableEmitter<DeviceEvents>() implements Device {
  private device: HID.HID
  private onClose: () => void

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
      hidDevice.write(createOutputReport([OUTPUT_REPORT_TYPE_REQUEST_FOR_CONFIG]))

      // try to read configuration. 100 attempts should be plenty.
      // TODO: this needs some kind of timeout, nothing guarantees there will even be 100 reports
      // to read.
      for (let i = 0; i < 100; i++) {
        const data = await promisifiedHIDRead(hidDevice)
        const parsedReport = inputReportParser.parse(data)

        if (parsedReport.extraDataType === INPUT_REPORT_TYPE_CURRENT_CONFIGURATION) {
          const configuration = parsedReport.extraData as DeviceConfiguration // TODO: types
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
  }

  private handleError = (e: Error) => {
    console.error(e)
    this.close()
  }

  private handleData = (data: Buffer) => {
    const parsed = inputReportParser.parse(data)

    if (parsed.extraDataType === INPUT_REPORT_TYPE_SENSOR_VALUES) {
      const sensorValuesExtraData = parsed.extraData as any // TODO: types
      this.emit('inputData', {
        sensors: sensorValuesExtraData.sensors,
        buttons: getButtonFormatter(parsed.buttonBits)
      })
    }
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