import React from 'react'
import styled from 'styled-components'
import Button from './Button'
import { useSpring, animated } from 'react-spring'
import { buttonsFromDeviceDescription } from '../../../domain/Button'
import { DeviceDescription } from '../../../../../common-types/device'
import toPercentage from '../../../utils/toPercentage'

const ScalingContainer = styled(animated.div)`
  position: absolute;
  display: flex;
  flex-grow: 1;
  left: 0;
  top: 0;
  bottom: 0;
  transform-origin: 0% 50%;
  will-change: transform, width;

  > * {
    flex-grow: 1;
  }
`

const Container = styled.div`
  height: 100%;
  overflow: hidden;
  position: relative;
  width: 100%;
`

interface DeviceButtonsProps {
  serverAddress: string
  device: DeviceDescription
}

const DeviceButtons = React.memo<DeviceButtonsProps>(
  ({ serverAddress, device }) => {
    const buttons = React.useMemo(() => buttonsFromDeviceDescription(device), [
      device
    ])

    const [selectedButton, setSelectedButton] = React.useState<null | number>(
      null
    )

    const displayedItems = buttons.length

    const animationProps = useSpring({
      transform: `translateX(${
        selectedButton === null
          ? '0%'
          : toPercentage(-(selectedButton / displayedItems))
      }) scaleX(${selectedButton === null ? 1 / displayedItems : 1})`,
      width: toPercentage(displayedItems)
    })

    return (
      <Container>
        <ScalingContainer style={animationProps}>
          {buttons.map((button, i) => (
            <Button
              key={button.buttonIndex}
              button={button}
              device={device}
              serverAddress={serverAddress}
              selected={selectedButton === i}
              onBack={() => setSelectedButton(null)}
              onSelect={() => setSelectedButton(i)}
            />
          ))}
        </ScalingContainer>
      </Container>
    )
  }
)

export default DeviceButtons
