import { DeviceConfiguration } from '../Device'

const OUTPUT_REPORT_ID = 0x02

const OUTPUT_REPORT_TYPE_REQUEST_FOR_CONFIG = 0x01
const OUTPUT_REPORT_TYPE_SET_NEW_CONFIGURATION = 0x02

export const createOutputReportWriter = (buttonCount: number, sensorCount: number) => {
  const createOutputReport = (type: number, reportContent?: Buffer): number[] => {
    // TODO: automatically create report of correct size. for windows, this doesn't seem to matter,
    // but to linux it does. maybe parse report descriptor for this?
    const buffer = Buffer.alloc(30)
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
      // 2 bytes for every sensor (they're uint16), 4 bytes for request threshold (float)
      const buffer = Buffer.alloc(2 * sensorCount + 4)
      let pos = 0

      // sensor thresholds
      for (let i = 0; i < sensorCount; i++) {
        buffer.writeUInt16LE(conf.sensorThresholds[i], pos)
        pos += 2
      }

      // release threshold
      buffer.writeFloatLE(conf.releaseThreshold, pos)

      return createOutputReport(OUTPUT_REPORT_TYPE_SET_NEW_CONFIGURATION, buffer)
    }
  }
}
