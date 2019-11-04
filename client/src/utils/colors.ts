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
  menuBackground: chroma(colorValues.darkBlue)
    .brighten(0.3)
    .css(),
  menuBackdrop: 'rgba(0, 0, 0, 0.5)',
  menuItem: chroma(colorValues.darkBlue)
    .brighten(0.5)
    .css(),
  buttonBottomColor: colorValues.blue,
  buttonTopColor: colorValues.lighterBlue,
  pressedButtonBottomColor: chroma(colorValues.blue)
    .brighten(0.5)
    .css(),
  pressedBottomTopColor: chroma(colorValues.lighterBlue)
    .brighten(0.5)
    .css(),
  sensorBarColor: colorValues.yellow,
  thresholdBar: 'rgba(0, 0, 0, 0.15)',
  overThresholdBar: chroma(colorValues.yellow)
    .brighten(0.5)
    .css(),
  text: 'white'
}
