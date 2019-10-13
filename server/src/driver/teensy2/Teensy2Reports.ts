import { Parser } from 'binary-parser'

export enum ReportID {
  SENSOR_VALUES = 0x01,
  CURRENT_CONFIGURATION = 0x02
}

export interface InputReport {
  buttons: boolean[]
  sensorValues: number[]
}

export interface ConfigurationReport {
  sensorThresholds: number[]
  releaseThreshold: number
  sensorToButtonMapping: number[]
}

// TODO: shouldn't be needed eventually
// automatically create report of correct size. for windows, this doesn't seem to matter,
// but to linux it does. maybe parse report descriptor for this?
export const CONFIGURATION_REPORT_SIZE = 41

// report parsers

export const createInputReportParser = (buttonCount: number, sensorCount: number) => {
  const formatButtons = (data: number) => {
    const bitArray = new Array(buttonCount)

    for (let i = 0; i < 16; i++) {
      bitArray[i] = (data >> i) % 2 != 0
    }

    return bitArray
  }

  const inputReportParser = new Parser()
    .uint8('reportId', {
      assert: ReportID.SENSOR_VALUES
    })
    .uint16le('buttonBits')
    .array('sensorValues', {
      type: 'uint16le',
      length: sensorCount
    })

  return (data: Buffer): InputReport => {
    const parsed = inputReportParser.parse(data)

    return {
      buttons: formatButtons(parsed.buttonBits),
      sensorValues: parsed.sensorValues
    }
  }
}

export const createConfigurationReportParser = (buttonCount: number, sensorCount: number) => {
  const parser = new Parser()
    .uint8('reportId', {
      assert: ReportID.CURRENT_CONFIGURATION
    })
    .array('sensorThresholds', {
      type: 'uint16le',
      length: sensorCount
    })
    .floatle('releaseThreshold')
    .array('sensorToButtonMapping', {
      type: 'int8',
      length: sensorCount
    })

  return (data: Buffer): ConfigurationReport => {
    return parser.parse(data)
  }
}

// report writers

const createOutputReport = (
  reportId: number,
  reportSize: number,
  reportContent?: Buffer
): number[] => {
  const buffer = Buffer.alloc(reportSize + 1)
  buffer.writeUInt8(reportId, 0)

  if (reportContent) {
    reportContent.copy(buffer, 1)
  }

  // node-hid wants arrays, so...
  return [...buffer]
}

export const createOutputReportWriter = (buttonCount: number, sensorCount: number) => {
  return {
    setNewConfiguration: (conf: ConfigurationReport) => {
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

      return createOutputReport(ReportID.CURRENT_CONFIGURATION, buffer.length, buffer)
    }
  }
}
