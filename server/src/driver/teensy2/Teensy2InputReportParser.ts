import { Parser } from 'binary-parser'

export enum InputReportExtraDataType {
  SENSOR_VALUES = 0x01,
  CURRENT_CONFIGURATION = 0x02
}

export type InputReportExtraData =
  | {
      type: InputReportExtraDataType.SENSOR_VALUES
      sensorValues: number[]
    }
  | {
      type: InputReportExtraDataType.CURRENT_CONFIGURATION
      sensorThresholds: number[]
      releaseThreshold: number
      sensorToButtonMapping: number[]
    }

export interface InputReport {
  buttons: boolean[]
  extraData: InputReportExtraData
}

type ParserResultType<T> = T extends Parser<infer T> ? T : never

export const createInputReportParser = (buttonCount: number, sensorCount: number) => {
  const formatButtons = (data: number) => {
    const bitArray = new Array(buttonCount)

    for (let i = 0; i < 16; i++) {
      bitArray[i] = (data >> i) % 2 != 0
    }

    return bitArray
  }

  const sensorValueParser = new Parser().array('sensorValues', {
    type: 'uint16le',
    length: sensorCount
  })

  const currentConfigurationParser = new Parser()
    .array('sensorThresholds', {
      type: 'uint16le',
      length: sensorCount
    })
    .floatle('releaseThreshold')
    .array('sensorToButtonMapping', {
      type: 'int8',
      length: sensorCount
    })

  const inputReportParser = new Parser()
    .uint8('reportId', {
      assert: 1
    })
    .uint16le('buttonBits')
    .uint8('extraDataType')
    .choice('extraData', {
      tag: 'extraDataType',
      choices: {
        [InputReportExtraDataType.SENSOR_VALUES]: sensorValueParser,
        [InputReportExtraDataType.CURRENT_CONFIGURATION]: currentConfigurationParser
      }
    })

  return (data: Buffer): InputReport => {
    // Parser#choice has pretty crap types, let's help it a bit...
    const parsed = inputReportParser.parse(data) as ParserResultType<typeof inputReportParser> &
      (
        | {
            extraDataType: InputReportExtraDataType.SENSOR_VALUES
            extraData: ParserResultType<typeof sensorValueParser>
          }
        | {
            extraDataType: InputReportExtraDataType.CURRENT_CONFIGURATION
            extraData: ParserResultType<typeof currentConfigurationParser>
          })

    const base = {
      buttons: formatButtons(parsed.buttonBits)
    }

    if (parsed.extraDataType === InputReportExtraDataType.SENSOR_VALUES) {
      return {
        ...base,
        extraData: {
          type: InputReportExtraDataType.SENSOR_VALUES,
          sensorValues: parsed.extraData.sensorValues
        }
      }
    } else if (parsed.extraDataType === InputReportExtraDataType.CURRENT_CONFIGURATION) {
      return {
        ...base,
        extraData: {
          type: InputReportExtraDataType.CURRENT_CONFIGURATION,
          sensorThresholds: parsed.extraData.sensorThresholds,
          releaseThreshold: parsed.extraData.releaseThreshold,
          sensorToButtonMapping: parsed.extraData.sensorToButtonMapping
        }
      }
    }

    throw new Error(
      `Could not parse input report, unknown extra data type ${(parsed as any).extraDataType}`
    )
  }
}
