import React, { useEffect } from 'react'
import styled from 'styled-components'
import scale from '../../../utils/scale'
import { colors } from '../../../utils/colors'
import { ButtonType } from '../../../domain/Button'
import { useSpring, animated } from 'react-spring'
import Sensor from './Sensor'
import { DeviceDescription } from '../../../../../common-types/device'
import { useServerContext } from '../../../context/SocketContext'
import { DeviceInputEvent } from '../../../../../common-types/messages'

const NOT_PRESSED_BACKGROUND = `linear-gradient(to top, ${colors.buttonBottomColor} 0%, ${colors.buttonTopColor} 100%)`
const PRESSED_BACKGROUND = `linear-gradient(to top, ${colors.pressedButtonBottomColor} 0%, ${colors.pressedBottomTopColor} 100%)`

const Container = styled(animated.div)`
  position: relative;
  background: ${NOT_PRESSED_BACKGROUND};
  display: flex;
  white-space: nowrap;
`

const Header = styled(animated.div)`
  position: absolute;
  left: ${scale(2)};
  top: ${scale(1.5)};
  z-index: 2;
`

const Sensors = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: 100%;
  width: 100%;

  > * {
    margin: 0 2%;
    width: 20%;
  }
`

interface Props {
  serverAddress: string
  device: DeviceDescription
  button: ButtonType
  selected?: boolean
  onSelect?: () => void
  onBack?: () => void
}

const Button = React.memo<Props>(
  ({ selected, button, device, serverAddress, onSelect, onBack }) => {
    const serverContext = useServerContext()

    const interfaceElementsStyle = useSpring({
      opacity: selected ? 1 : 0
    })

    const [pressedStyle, setPressedStyle] = useSpring(() => ({
      background: NOT_PRESSED_BACKGROUND
    }))

    const handleInputEvent = React.useCallback(
      (inputEvent: DeviceInputEvent) => {
        const isPressed = inputEvent.inputData.buttons[button.buttonIndex]

        setPressedStyle({
          background: isPressed ? PRESSED_BACKGROUND : NOT_PRESSED_BACKGROUND,
          immediate: true
        })
      },
      [button.buttonIndex, setPressedStyle]
    )

    useEffect(
      () =>
        serverContext.subscribeToInputEvents(
          serverAddress,
          device.id,
          handleInputEvent
        ),
      [serverAddress, device, serverContext, handleInputEvent]
    )

    return (
      <Container
        style={pressedStyle}
        onClick={!selected ? onSelect : undefined}
      >
        <Header style={interfaceElementsStyle}>
          <button onClick={onBack}>Back</button>
          {button.buttonIndex}
        </Header>

        <Sensors>
          {button.sensors.map(sensor => (
            <Sensor
              key={sensor.sensorIndex}
              device={device}
              serverAddress={serverAddress}
              sensor={sensor}
              enableThresholdChange={!!selected}
            />
          ))}
        </Sensors>
      </Container>
    )
  }
)

export default Button
