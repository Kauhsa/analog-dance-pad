import React from 'react'
import styled, { css } from 'styled-components'
import scale from '../utils/scale'
import { colors } from '../utils/colors'
import { ButtonType } from '../domain/Button'
import { useSpring, animated } from 'react-spring'
import Sensor from './Sensor'

const Container = styled(animated.div)<{ isPressed: boolean }>`
  position: relative;
  border-radius: ${scale(0.5)};
  background: linear-gradient(
    to top,
    ${colors.buttonBottomColor} 0%,
    ${colors.buttonTopColor} 100%
  );

  display: flex;
  white-space: nowrap;

  ${props =>
    props.isPressed &&
    css`
      background: linear-gradient(
        to top,
        ${colors.pressedButtonBottomColor} 0%,
        ${colors.pressedBottomTopColor} 100%
      );
    `}
`

const Header = styled(animated.div)`
  position: absolute;
  left: ${scale(2)};
  top: ${scale(1.5)};
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
  button: ButtonType
  selected?: boolean
  onSelect?: () => void
  onBack?: () => void
}

const Button = React.memo<Props>(({ selected, button, onSelect, onBack }) => {
  const interfaceElementsStyle = useSpring({
    opacity: selected ? 1 : 0
  })

  return (
    <Container
      isPressed={button.pressed}
      onClick={!selected ? onSelect : undefined}
    >
      <Header style={interfaceElementsStyle}>
        <button onClick={onBack}>Back</button>
        {button.name}
      </Header>

      <Sensors>
        {button.sensors.map(sensor => (
          <Sensor
            key={sensor.id}
            sensor={sensor}
            enableThresholdChange={!!selected}
          />
        ))}
      </Sensors>
    </Container>
  )
})

export default Button
