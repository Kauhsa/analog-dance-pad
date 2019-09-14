import chroma from 'chroma-js'

export const colorValues = {
  darkBlue: '#041623',
  blue: '#2364AA',
  lightBlue: '#1791EA',
  lighterBlue: '#46C7FE',
  yellow: '#FEE501'
}

export const colors = {
  background: colorValues.darkBlue,
  buttonBottomColor: colorValues.blue,
  buttonTopColor: colorValues.lighterBlue,
  pressedButtonBottomColor: chroma(colorValues.blue)
    .brighten(0.5)
    .css(),
  pressedBottomTopColor: chroma(colorValues.lighterBlue)
    .brighten(0.5)
    .css(),
  sensorBarBottomColor: colorValues.lightBlue,
  sensorBarTopColor: colorValues.yellow,
  thresholdBar: 'rgba(0, 0, 0, 0.15)',
  overThresholdBar: 'rgba(255, 255, 255, 0.5)'
}
