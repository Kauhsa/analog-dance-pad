import { Parser } from 'binary-parser'

const MAX_NAME_SIZE = 50

export enum ReportID {
  SENSOR_VALUES = 0x01,
  PAD_CONFIGURATION = 0x02,
  RESET = 0x03,
  SAVE_CONFIGURATION = 0x04,
  NAME = 0x05
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

export interface NameReport {
  name: string
}

export class ReportManager {
  private buttonCount: number
  private sensorCount: number
  private inputReportParser: Parser<any>
  private configurationReportParser: Parser<any>
  private nameReportParser: Parser<any>

  constructor(settings: { buttonCount: number; sensorCount: number }) {
    this.buttonCount = settings.buttonCount
    this.sensorCount = settings.sensorCount

    this.inputReportParser = new Parser()
      .uint8('reportId', {
        assert: ReportID.SENSOR_VALUES
      })
      .uint16le('buttonBits')
      .array('sensorValues', {
        type: 'uint16le',
        length: settings.sensorCount
      })

    this.configurationReportParser = new Parser()
      .uint8('reportId', {
        assert: ReportID.PAD_CONFIGURATION
      })
      .array('sensorThresholds', {
        type: 'uint16le',
        length: this.sensorCount
      })
      .floatle('releaseThreshold')
      .array('sensorToButtonMapping', {
        type: 'int8',
        length: this.sensorCount
      })

    this.nameReportParser = new Parser()
      .uint8('reportId', {
        assert: ReportID.NAME
      })
      .uint8('size')
      .string('name', { length: 'size' })
  }

  private formatButtons = (data: number) => {
    const bitArray = new Array(this.buttonCount)

    for (let i = 0; i < this.buttonCount; i++) {
      bitArray[i] = (data >> i) % 2 != 0
    }

    return bitArray
  }

  parseInputReport(data: Buffer): InputReport {
    const parsed = this.inputReportParser.parse(data)

    return {
      buttons: this.formatButtons(parsed.buttonBits),
      sensorValues: parsed.sensorValues
    }
  }

  parseConfigurationReport(data: Buffer): ConfigurationReport {
    const parsed = this.configurationReportParser.parse(data)

    return {
      releaseThreshold: parsed.releaseThreshold,
      sensorThresholds: parsed.sensorThresholds,
      sensorToButtonMapping: parsed.sensorToButtonMapping
    }
  }

  parseNameReport(data: Buffer): NameReport {
    const parsed = this.nameReportParser.parse(data)

    return {
      name: parsed.name
    }
  }

  getConfigurationReportSize = () => {
    // size is as follows:
    // - 1 byte for report id
    // - 2 bytes for every sensor threshold (they're uint16)
    // - 4 bytes for request threshold (float)
    // - 1 byte for sensor to button mapping (int8)
    return 2 * this.sensorCount + 4 + this.sensorCount + 1
  }

  createConfigurationReport(conf: ConfigurationReport): number[] {
    const buffer = Buffer.alloc(this.getConfigurationReportSize())
    let pos = 0

    // report ID
    buffer.writeUInt8(ReportID.PAD_CONFIGURATION, pos)
    pos += 1

    // sensor thresholds
    for (let i = 0; i < this.sensorCount; i++) {
      buffer.writeUInt16LE(conf.sensorThresholds[i], pos)
      pos += 2
    }

    // release threshold
    buffer.writeFloatLE(conf.releaseThreshold, pos)
    pos += 4

    // sensor to button mapping
    for (let i = 0; i < this.sensorCount; i++) {
      buffer.writeInt8(conf.sensorToButtonMapping[i], pos)
      pos += 1
    }

    return [...buffer]
  }

  createSaveConfigurationReport(): number[] {
    return [ReportID.SAVE_CONFIGURATION, 0x00]
  }

  getNameReportSize(): number {
    // 1 for report id
    // 1 for size (uint8)
    return 1 + 1 + MAX_NAME_SIZE
  }

  createNameReport(report: NameReport): number[] {
    const buffer = Buffer.alloc(this.getNameReportSize())
    let pos = 0

    // report ID
    buffer.writeUInt8(ReportID.NAME, pos)
    pos += 1

    // name length
    buffer.writeUInt8(report.name.length, pos)
    pos += 1

    // name itself
    buffer.write(report.name, pos, 'utf8')

    return [...buffer]
  }
}
