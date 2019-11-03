import 'sanitize.css'
import 'sanitize.css/forms.css'
import 'sanitize.css/typography.css'

import React from 'react'
import Connection from './networking/Connection'
import ButtonGroup from './components/SensorGroup'
import styled, { createGlobalStyle } from 'styled-components'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { ButtonType } from './domain/Button'
import { colors } from './utils/colors'
import { DevicesUpdatedEvent, InputEvent } from './networking/NetworkEvents'
import { Device } from './networking/Device'

let devices: Map<string, Device> = new Map<string, Device>()
let selectedDevice: Device

let BUTTONS: ButtonType[] = []

const dummyData: Device = {
  id: 'test',
  configuration: {
    sensorThresholds: [0.5, 0.5, 0.3, 0.4, 0.35, 0.5, 0.3, 0.4, 0.3],
    releaseThreshold: 0.8,
    sensorToButtonMapping: [0, 0, 0, 1, 1, 2, 2, 3, 3]
  },
  properties: {
    buttonCount: 4,
    sensorCount: 9
  }
}

Connection.subscribeOnDevicesUpdated((e: DevicesUpdatedEvent) => {
  console.log('App:DevicesUpdated', e)

  //TODO: Figure out proper logic for managing devices on client side
  devices = new Map<string, Device>()
  e.devices.forEach((device: Device) => {
    devices.set(device.id, device)
  })

  //TODO: implement proper logic - now select first or dummy data
  const device = e.devices.length > 0 ? e.devices[0] : dummyData
  selectDevice(device)
})

const selectDevice = (device: Device) => {
  console.log('App:selectDevice', device)
  if (!!selectedDevice) {
    Connection.unsubsribeFromDevice({ deviceId: selectedDevice.id })
  }

  selectedDevice = device
  Connection.subscribeToDevice({ deviceId: device.id })
  updateButtons(selectedDevice)
}

const updateButtons = (device: Device) => {
  BUTTONS = []

  for (let i = 0; i < device.properties.buttonCount; i++) {
    BUTTONS.push({
      name: 'Button ' + (i + 1), // TODO: Where do we get this?
      sensors: [],
      pressed: false // TODO: Where do we get this? Always default to false?
    })
  }

  for (let i = 0; i < device.properties.sensorCount; i++) {
    const buttonId = device.configuration.sensorToButtonMapping[i]
    const threshold = device.configuration.sensorThresholds[i]

    BUTTONS[buttonId].sensors.push({
      id: i,
      value: 0,
      threshold: threshold
    })
  }

  console.log('App:updateButtons', BUTTONS)
}

Connection.subscribeOnInputReceived((e: InputEvent) => {
  console.log('App:inputReceived', e)
  if (e.deviceId !== selectedDevice.id) return

  BUTTONS.forEach(button => {
    button.sensors.forEach(sensor => {
      sensor.value = e.inputData.sensors[sensor.id]
    })
  })
  e.inputData.buttons.forEach((buttonPressed, index) => {
    BUTTONS[index].pressed = buttonPressed
  })
})

const AppContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`

const GlobalStyles = createGlobalStyle`
  html, body, #root {
    height: 100%;
  }

  body {
    overscroll-behavior: contain;
    background-color: ${colors.background};
    font-family: 'Exo 2', sans-serif;
  }
`

selectDevice(dummyData)

const App = () => (
  <HelmetProvider>
    <Helmet>
      <meta name="theme-color" content={colors.background} />
    </Helmet>

    <GlobalStyles />

    <AppContainer>
      <ButtonGroup buttons={BUTTONS} />
    </AppContainer>
  </HelmetProvider>
)

export default App
