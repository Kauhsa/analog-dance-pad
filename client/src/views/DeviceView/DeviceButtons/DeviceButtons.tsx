import React from 'react'
import styled from 'styled-components'
import scale from '../../../utils/scale'
import Button from './Button'
import { useSpring, animated } from 'react-spring'
import { buttonsFromDeviceDescription } from '../../../domain/Button'
import { DeviceDescription } from '../../../../../common-types/device'

const ScalingContainer = styled(animated.div)`
  position: absolute;
  display: flex;
  flex-grow: 1;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;

  > * {
    flex-grow: 1;
    margin: ${scale(0.5)};
  }
`

const Container = styled.div`
  height: 100%;
  overflow: hidden;
  position: relative;
  width: 100%;
`

interface DeviceButtonsProps {
  device: DeviceDescription
}

const DeviceButtons = React.memo<DeviceButtonsProps>(({ device }) => {
  const buttons = React.useMemo(() => {
    return buttonsFromDeviceDescription(device)
  }, [device])

  const [selectedButton, setSelectedButton] = React.useState<null | number>(
    null
  )

  const displayedItems = buttons.length

  const animationProps = useSpring({
    width: selectedButton === null ? '100%' : `${displayedItems * 100}%`,
    left: selectedButton === null ? '0%' : `-${selectedButton * 100}%`
  })

  return (
    <Container>
      <ScalingContainer style={animationProps}>
        {buttons.map((button, i) => (
          <Button
            key={button.buttonIndex}
            button={button}
            selected={selectedButton === i}
            onBack={() => setSelectedButton(null)}
            onSelect={() => setSelectedButton(i)}
          />
        ))}
      </ScalingContainer>
    </Container>
  )
})

export default DeviceButtons
