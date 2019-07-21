import { DeviceConfiguration } from '../Device'

const OUTPUT_REPORT_ID = 0x02

const OUTPUT_REPORT_TYPE_REQUEST_FOR_CONFIG = 0x01
const OUTPUT_REPORT_TYPE_SET_NEW_CONFIGURATION = 0x02

export const createOutputReportWriter = (buttonCount: number, sensorCount: number) => {
  const createOutputReport = (type: number, reportContent?: Buffer): number[] => {
    // TODO: automatically create report of correct size. for windows, this doesn't seem to matter,
    // but to linux it does. maybe parse report descriptor for this?
    const buffer = Buffer.alloc(42)
    buffer.writeUInt8(OUTPUT_REPORT_ID, 0)
    buffer.writeUInt8(type, 1)

    if (reportContent) {
      reportContent.copy(buffer, 2)
    }

    // node-hid wants arrays, so...
    return [...buffer]
  }

  return {
    requestForConfiguration: () => createOutputReport(OUTPUT_REPORT_TYPE_REQUEST_FOR_CONFIG),

    setNewConfiguration: (conf: DeviceConfiguration) => {
      // size is as follows:
      // - 2 bytes for every sensor threshold (they're uint16)
      // - 4 bytes for request threshold (float)
      // - 1 byte for sensor to button mapping (int8)
      const buffer = Buffer.alloc(2 * sensorCount + 4 + sensorCount)
      let pos = 0

      // sensor thresholds
      for (let i = 0; i < sensorCount; i++) {
        buffer.writeUInt16LE(conf.sensorThresholds[i], pos)
        pos += 2
      }

      // release threshold
      buffer.writeFloatLE(conf.releaseThreshold, pos)
      pos += 4

      // sensor to button mapping
      for (let i = 0; i < sensorCount; i++) {
        buffer.writeInt8(conf.sensorToButtonMapping[i], pos)
        pos += 1
      }

      return createOutputReport(OUTPUT_REPORT_TYPE_SET_NEW_CONFIGURATION, buffer)
    }
  }
}
