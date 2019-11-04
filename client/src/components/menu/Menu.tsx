import React from 'react'
import { animated, useSpring } from 'react-spring'
import styled from 'styled-components'
import { sortBy } from 'lodash-es'

import scale from '../../utils/scale'
import { colors } from '../../utils/colors'
import { useMenuContext } from '../../context/MenuContext'
import { useServerContext } from '../../context/SocketContext'
import { largeText } from '../Typography'
import MenuServer from './MenuServer'

const MenuContainer = styled(animated.nav)`
  background-color: ${colors.menuBackground};
  bottom: 0;
  position: fixed;
  left: ${scale(-5)};
  padding-left: ${scale(5)};
  max-width: ${scale(40)};
  top: 0;
  width: calc(80% + ${scale(5)});
  z-index: 11;
  will-change: transform;
`

const Backdrop = styled(animated.div)`
  background-color: ${colors.menuBackdrop};
  bottom: 0;
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 10;
  will-change: opacity;
`

const MenuHeader = styled.h1`
  ${largeText};
  margin: ${scale(2)} ${scale(2)} 0 ${scale(2)};
`

const ServersContainer = styled.div`
  > * {
    margin-bottom: ${scale(5)};
  }
`

const Menu = () => {
  const { isMenuOpen, closeMenu } = useMenuContext()
  const { serversState } = useServerContext()

  const containerStyle = useSpring({
    transform: isMenuOpen ? 'translateX(0%)' : 'translateX(-100%)',
    config: { mass: 1, tension: 400, friction: 30 }
  })

  const backdropStyle = useSpring({
    opacity: isMenuOpen ? 1 : 0,
    pointerEvents: isMenuOpen ? 'auto' : 'none'
  })

  const sortedServers = React.useMemo(() => {
    const servers = Object.values(serversState.servers)
    return sortBy(servers, s => s.address)
  }, [serversState.servers])

  return (
    <>
      <Backdrop style={backdropStyle} onClick={closeMenu} />
      <MenuContainer style={containerStyle}>
        <MenuHeader>Devices</MenuHeader>
        <ServersContainer>
          {sortedServers.map(server => (
            <MenuServer
              key={server.address}
              server={server}
              onDeviceClick={closeMenu}
            />
          ))}
        </ServersContainer>
      </MenuContainer>
    </>
  )
}

export default Menu
