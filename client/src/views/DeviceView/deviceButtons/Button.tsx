import React, { useEffect } from 'react'
import styled from 'styled-components'
import scale from '../../../utils/scale'
import { colors } from '../../../utils/colors'
import { ButtonType } from '../../../domain/Button'
import { useSpring, animated } from 'react-spring'
import Sensor from './Sensor'
import {
  DeviceDescription,
  DeviceInputData
} from '../../../../../common-types/device'
import { useServerConnectionByAddr } from '../../../context/SocketContext'
import { faArrowCircleLeft } from '@fortawesome/free-solid-svg-icons'
import IconButton from '../../../components/IconButton'
import { largeText } from '../../../components/Typography'
import { usePreventMobileSafariDrag } from '../../../utils/usePreventiOSDrag'

const NOT_PRESSED_BACKGROUND = `linear-gradient(to top, ${colors.buttonBottomColor} 0%, ${colors.buttonTopColor} 100%)`
const PRESSED_BACKGROUND = `linear-gradient(to top, ${colors.pressedButtonBottomColor} 0%, ${colors.pressedBottomTopColor} 100%)`

const Container = styled.div`
  position: relative;
  background: ${NOT_PRESSED_BACKGROUND};
  display: flex;
  white-space: nowrap;
  margin: 0 ${scale(1)};
`

const Header = styled(animated.div)`
  align-items: center;
  color: ${colors.text};
  display: flex;
  left: ${scale(2)};
  position: absolute;
  right: ${scale(2)};
  top: ${scale(2)};
  z-index: 2;
`

const ButtonName = styled.div`
  margin-left: ${scale(1)};
  ${largeText};
`

const Sensors = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: calc(100% - ${scale(10)});
  bottom: 0;
  left: 0;
  right: 0;

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
    const serverConnection = useServerConnectionByAddr(serverAddress)

    const headerStyle = useSpring({
      opacity: selected ? 0.75 : 0,
      config: { duration: 100 }
    })

    const buttonContainerRef = React.useRef<HTMLDivElement>(null)
    const currentlyPressedRef = React.useRef(false)

    // we need this so the sensor threshold drags won't be annoying.
    usePreventMobileSafariDrag(buttonContainerRef)

    const handleInputEvent = React.useCallback(
      (inputData: DeviceInputData) => {
        const isPressed = inputData.buttons[button.buttonIndex]

        if (
          currentlyPressedRef.current !== isPressed &&
          buttonContainerRef.current !== null
        ) {
          currentlyPressedRef.current = isPressed
          buttonContainerRef.current.style.background = isPressed
            ? PRESSED_BACKGROUND
            : NOT_PRESSED_BACKGROUND
        }
      },
      [button.buttonIndex]
    )

    useEffect(() => {
      if (!serverConnection) {
        return
      }

      return serverConnection.subscribeToInputEvents(
        device.id,
        handleInputEvent
      )
    }, [serverAddress, device, handleInputEvent, serverConnection])

    return (
      <Container
        ref={buttonContainerRef}
        onClick={!selected ? onSelect : undefined}
      >
        <Header style={headerStyle}>
          <IconButton
            size={scale(4)}
            onClick={onBack}
            icon={faArrowCircleLeft}
          />
          <ButtonName>Button {button.buttonIndex + 1}</ButtonName>
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
