import * as HID from 'node-hid'
import usbDetection from 'usb-detection'
import consola from 'consola'
import PQueue from 'p-queue'

import { DeviceProperties, DeviceConfiguration } from '../../../../common-types/device'
import { DeviceDriver, DeviceDriverEvents } from '../Driver'
import { DeviceEvents, Device } from '../Device'
import { ReportManager, ReportID } from './Teensy2Reports'
import { ExtendableEmitter } from '../../util/ExtendableStrictEmitter'
import delay from '../../util/delay'

export const VENDOR_ID = 0x03eb
export const PRODUCT_ID = 0x204f

// in future version, I'd like to device to tell this information
const SENSOR_COUNT = 12
const BUTTON_COUNT = 16

const reportManager = new ReportManager({ buttonCount: BUTTON_COUNT, sensorCount: SENSOR_COUNT })

const MAX_SENSOR_VALUE = 850 // Maximum value for a sensor reading. Depends on the used resistors in the setup.
const NTH_DEGREE_COEFFICIENT = 0.9 // Magic number
const FIRST_DEGREE_COEFFICIENT = 0.1 // Magic number jr.
const LINEARIZATION_POWER = 4 // The linearization function degree / power

const LINEARIZATION_MAX_VALUE = Math.pow(MAX_SENSOR_VALUE, LINEARIZATION_POWER) / MAX_SENSOR_VALUE

const calculateLinearizationValue = (value: number): number => {
  const linearizedValue = Math.pow(value, LINEARIZATION_POWER) / LINEARIZATION_MAX_VALUE
  return (
    linearizedValue * NTH_DEGREE_COEFFICIENT + Math.round(value * FIRST_DEGREE_COEFFICIENT)
  )
}

interface LinearizationValue {
  [key: string]: number
}

const LINEARIZATION_LOOKUP_TABLE: LinearizationValue = {}
const DELINEARIZATION_LOOKUP_TABLE: LinearizationValue = {}
const DELINEARIZATION_LOOKUP_DIGITS = 12

for (let i = MAX_SENSOR_VALUE; i >= 0; i--) {
  const linearizedValue = calculateLinearizationValue(i)
  LINEARIZATION_LOOKUP_TABLE[i] = linearizedValue
  DELINEARIZATION_LOOKUP_TABLE[Math.floor(linearizedValue)] = i
  DELINEARIZATION_LOOKUP_TABLE[linearizedValue.toFixed(DELINEARIZATION_LOOKUP_DIGITS)] = i
}

/* For testing
for (let i = 0; i <= MAX_SENSOR_VALUE; i++) {
  console.log(
    'raw: ',
    i,
    ', linearized: ',
    LINEARIZATION_LOOKUP_TABLE[i],
    ', delinearized: ',
    DELINEARIZATION_LOOKUP_TABLE[
      LINEARIZATION_LOOKUP_TABLE[i].toFixed(DELINEARIZATION_LOOKUP_DIGITS)
    ]
  )
}
*/

/* For if we ever want to not rely on the lookup tables

for (let i = MAX_SENSOR_VALUE; i >= 0; i--) {
  LINEARIZATION_RAW_PARTS[Math.floor(linearizeValue(i))] = getLinearizationRawPart(i)
}

const delinearizeValue = (value: number): number => {
  if (value > MAX_SENSOR_VALUE) value = MAX_SENSOR_VALUE

  let rawPart = -1

  let x: number = 0

  while (rawPart < 0) {
    if (typeof LINEARIZATION_RAW_PARTS[(Math.floor(value) - x).toString()] !== 'undefined') {
      rawPart = LINEARIZATION_RAW_PARTS[(Math.floor(value) - x).toString()]
    }
    x++
  }

  const linearizedPart = Math.pow(
    ((value - rawPart) / LINEARIZED_VALUE_WEIGHT) * LINEARIZATION_MAX_VALUE,
    1.0 / LINEARIZATION_POWER
  )

  return Math.floor(linearizedPart)
}
*/

const linearizeValue = (value: number) => {
  return LINEARIZATION_LOOKUP_TABLE[value]
}

const delinearizeValue = (value: number) => {
  return DELINEARIZATION_LOOKUP_TABLE[value]
}

const linearizeSensorValues = (numbers: number[]) => numbers.map(linearizeValue)
const delinearizeSensorValues = (numbers: number[]) => numbers.map(delinearizeValue)
const normalizeSensorValues = (numbers: number[]) => numbers.map(n => n / MAX_SENSOR_VALUE)
const denormalizeSensorValues = (numbers: number[]) =>
  numbers.map(n => Math.floor(n * MAX_SENSOR_VALUE))

export class Teensy2Device extends ExtendableEmitter<DeviceEvents>() implements Device {
  private device: HID.HID
  private path: string
  private onClose: () => void
  private eventsSinceLastUpdate: number
  private eventRateInterval: NodeJS.Timeout
  private sendQueue: PQueue

  id: string

  properties: DeviceProperties = {
    buttonCount: BUTTON_COUNT,
    sensorCount: SENSOR_COUNT
  }

  configuration: DeviceConfiguration

  static async fromDevicePath(devicePath: string, onClose: () => void): Promise<Teensy2Device> {
    const hidDevice = new HID.HID(devicePath)

    try {
      const padConfigurationData = hidDevice.getFeatureReport(
        ReportID.PAD_CONFIGURATION,
        reportManager.getConfigurationReportSize()
      )
      const padConfigurationReport = reportManager.parseConfigurationReport(
        Buffer.from(padConfigurationData)
      )

      const nameData = hidDevice.getFeatureReport(ReportID.NAME, reportManager.getNameReportSize())
      const nameReport = reportManager.parseNameReport(Buffer.from(nameData))

      const configuration: DeviceConfiguration = {
        name: nameReport.name,
        sensorThresholds: normalizeSensorValues(
          linearizeSensorValues(padConfigurationReport.sensorThresholds)
        ),
        releaseThreshold: padConfigurationReport.releaseThreshold,
        sensorToButtonMapping: padConfigurationReport.sensorToButtonMapping
      }
      return new Teensy2Device(devicePath, configuration, hidDevice, onClose)
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
    this.path = path
    this.id = 'teensy-2-device-' + path
    this.configuration = configuration
    this.device = device
    this.onClose = onClose
    this.device.on('error', this.handleError)
    this.device.on('data', this.handleData)

    // initialize event rate tracking
    this.eventRateInterval = setInterval(this.handleEventRateMeasurement, 1000)
    this.eventsSinceLastUpdate = 0

    // initialize send queue
    this.sendQueue = new PQueue({ concurrency: 1 })
  }

  private handleError = (e: Error) => {
    consola.error(`Error received from HID device in path "${this.path}":`, e)
    this.close()
  }

  private handleData = (data: Buffer) => {
    this.eventsSinceLastUpdate++
    const inputReport = reportManager.parseInputReport(data)

    this.emit('inputData', {
      buttons: inputReport.buttons,
      sensors: normalizeSensorValues(linearizeSensorValues(inputReport.sensorValues))
    })
  }

  private handleEventRateMeasurement = () => {
    this.emit('eventRate', this.eventsSinceLastUpdate)
    this.eventsSinceLastUpdate = 0
  }

  // What's the idea here? Well - node-hid doesn't like if we do multiple
  // different things (send feature reports, write data) to the same device
  // within same millisecond, because USB spec doesn't allow that. So we battle
  // this by putting all writes and feature report requests to a queue where
  // there will always be at least some milliseconds between events.
  private sendEventToQueue = async <T>(event: () => Promise<T>): Promise<T> => {
    const promise = this.sendQueue.add(() => event())
    this.sendQueue.add(() => delay(2))
    return await promise
  }

  public async updateConfiguration(updates: Partial<DeviceConfiguration>) {
    const newConfiguration = { ...this.configuration, ...updates }

    // TODO: only send configuration reports that are necessary

    await this.sendEventToQueue(async () => {
      const report = reportManager.createConfigurationReport({
        releaseThreshold: newConfiguration.releaseThreshold,
        sensorThresholds: delinearizeSensorValues(
          denormalizeSensorValues(newConfiguration.sensorThresholds)
        ),
        sensorToButtonMapping: newConfiguration.sensorToButtonMapping
      })
      this.device.sendFeatureReport(report)
    })

    await this.sendEventToQueue(async () => {
      const report = reportManager.createNameReport({ name: newConfiguration.name })
      this.device.sendFeatureReport(report)
    })

    this.configuration = newConfiguration
  }

  public async saveConfiguration() {
    await this.sendEventToQueue(async () => {
      this.device.write(reportManager.createSaveConfigurationReport())
    })
  }

  close() {
    clearInterval(this.eventRateInterval)
    this.sendQueue.pause()
    this.sendQueue.clear()
    this.device.close()
    this.onClose()
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
      consola.error('Could not connect to a new device:', e)
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
        consola.error('New device was detected, but no device path was returned')
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
    consola.info('Started Teensy2DeviceDriver, listening for new devices...')
    this.knownDevicePaths.clear()

    // first connect to whatever devices are connected to computer now
    this.connectToNewDevices()

    // ...and then start monitoring for future changes
    usbDetection.on('add', (device: { vendorId: number; productId: number }) => {
      if (device.vendorId === VENDOR_ID && device.productId === PRODUCT_ID) {
        consola.info('New Teensy2Driver devices detected, connecting...')

        // OSX seems to want to wait a while until it can find the new HID
        // device, so let's wait a while.
        setTimeout(() => this.connectToNewDevices(), 1000)
      }
    })
    usbDetection.startMonitoring()
  }

  close() {
    consola.info('Stopped Teensy2DeviceDriver')
    usbDetection.stopMonitoring()
  }
}
