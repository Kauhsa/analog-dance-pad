import React from 'react'
import styled from 'styled-components'
import scale from '../utils/scale'
import Button from './Button'
import { useSpring, animated } from 'react-spring'
import { ButtonType } from '../domain/Button'

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

interface ButtonGroupProps {
  buttons: ButtonType[]
}

const ButtonGroup = React.memo<ButtonGroupProps>(props => {
  const [selectedButton, setSelectedButton] = React.useState<null | number>(
    null
  )

  const displayedItems = props.buttons.length

  const animationProps = useSpring({
    width: selectedButton === null ? '100%' : `${displayedItems * 100}%`,
    left: selectedButton === null ? '0%' : `-${selectedButton * 100}%`
  })

  return (
    <Container>
      <ScalingContainer style={animationProps}>
        {props.buttons.map((button, i) => (
          <Button
            key={i}
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

export default ButtonGroup
