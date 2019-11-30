import React from 'react'
import { animated, useSpring } from 'react-spring'
import styled, { css } from 'styled-components'

import scale from '../../utils/scale'
import { colors } from '../../utils/colors'
import useFreeze from '../../utils/useFreeze'

const BACKDROP_Z_INDEX = 10

const Backdrop = styled(animated.div)`
  background-color: ${colors.menuBackdrop};
  bottom: 0;
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
  z-index: ${BACKDROP_Z_INDEX};
  will-change: opacity;
`

type MenuPosition = 'left' | 'right'

const MenuContainer = styled(animated.nav)<{ position: MenuPosition }>`
  background-color: ${colors.menuBackground};
  bottom: 0;
  position: fixed;
  max-width: ${scale(40)};
  top: 0;
  width: calc(80% + ${scale(5)});
  z-index: ${BACKDROP_Z_INDEX + 1};
  will-change: transform;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* for mobile safari */

  ${props =>
    props.position === 'left' &&
    css`
      left: ${scale(-5)};
      padding-left: ${scale(5)};
    `}

  ${props =>
    props.position === 'right' &&
    css`
      right: ${scale(-5)};
      padding-right: ${scale(5)};
    `}
`

interface Props {
  isOpen: boolean
  onClose: () => void
  children?: React.ReactNode
  position: MenuPosition
}

const Menu = React.memo<Props>(({ isOpen, children, onClose, position }) => {
  const [mountChildren, setMountChildren] = React.useState(isOpen)

  const closedTransform =
    position === 'left' ? 'translateX(-100%)' : 'translateX(100%)'

  const containerStyle = useSpring({
    transform: isOpen ? 'translateX(0%)' : closedTransform,
    config: { mass: 1, tension: 400, friction: 30 },
    onStart: () => {
      if (isOpen) {
        setMountChildren(true)
      }
    },
    onRest: () => {
      if (!isOpen) {
        setMountChildren(false)
      }
    }
  })

  const backdropStyle = useSpring({
    opacity: isOpen ? 1 : 0,
    pointerEvents: isOpen ? 'auto' : 'none'
  })

  const frozenChildren = useFreeze(children, !isOpen)

  return (
    <>
      <Backdrop style={backdropStyle} onClick={onClose} />
      <MenuContainer position={position} style={containerStyle}>
        {mountChildren && frozenChildren}
      </MenuContainer>
    </>
  )
})

export default Menu
