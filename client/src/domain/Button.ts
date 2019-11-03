import { DeviceDescription } from '../../../common-types/device'

export interface ButtonType {
  buttonIndex: number
  sensors: SensorType[]
}

export interface SensorType {
  sensorIndex: number
  threshold: number // between 0 and 1
}

export const buttonsFromDeviceDescription = (device: DeviceDescription) => {
  const buttons: Record<number, ButtonType> = {}

  for (
    let sensorIndex = 0;
    sensorIndex < device.properties.sensorCount;
    sensorIndex++
  ) {
    const buttonIndex = device.configuration.sensorToButtonMapping[sensorIndex]

    if (buttonIndex < 0 || buttonIndex >= device.properties.buttonCount) {
      continue
    }

    const sensor = {
      sensorIndex,
      threshold: device.configuration.sensorThresholds[sensorIndex]
    }

    const button = buttons[buttonIndex]

    if (!button) {
      buttons[buttonIndex] = {
        buttonIndex: buttonIndex,
        sensors: [sensor]
      }
    } else {
      buttons[buttonIndex].sensors.push(sensor)
    }
  }

  // TODO: sort.
  return Object.values(buttons)
}
