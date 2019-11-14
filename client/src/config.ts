// Server addresses. As of now, app doesn't support adding/removing addresses
// to connect to, so it needs to be defined at build time. Example:
// REACT_APP_SERVER_ADDRESSES="196.168.1.10:3333,196.168.1.11:3333"

const serverAddresses: string[] = process.env.REACT_APP_SERVER_ADDRESSES
  ? process.env.REACT_APP_SERVER_ADDRESSES.split(',')
  : ['localhost:3333']

// Calibration presets need to, for now, also be defined at build time. Format
// should be as follows.
// REACT_APP_CALIBARTION_PRESETS="Sensitive:2.00,Normal:5.00,Stiff:7.69"

type CalibrationPreset = {
  name: string
  calibrationBuffer: number
}

const parseCalibrationPresets = (env: string) => {
  return env.split(',').map(preset => {
    const [name, calibrationBuffer] = preset.split(':')

    return {
      name,
      calibrationBuffer: parseFloat(calibrationBuffer)
    }
  })
}

const calibrationPresetEnv = process.env.REACT_APP_CALIBRATION_PRESETS

const calibrationPresets: CalibrationPreset[] = calibrationPresetEnv
  ? parseCalibrationPresets(calibrationPresetEnv)
  : [
      { name: 'Sensitive', calibrationBuffer: 0.05 },
      { name: 'Normal', calibrationBuffer: 0.1 },
      { name: 'Stiff', calibrationBuffer: 0.15 }
    ]

export default {
  serverAddresses,
  calibrationPresets
}
