import React from 'react'
import styled from 'styled-components'
import { sortBy } from 'lodash-es'

import scale from '../../utils/scale'
import { useMenuContext } from '../../context/MenuContext'
import { useServerContext } from '../../context/SocketContext'
import MenuServer from './MenuServer'
import Menu from '../menu/Menu'
import MenuHeader from '../menu/MenuHeader'

const ServersContainer = styled.div`
  > * {
    margin-bottom: ${scale(5)};
  }
`

const MainMenu = () => {
  const { isMenuOpen, closeMenu } = useMenuContext()
  const { serversState } = useServerContext()

  const sortedServers = React.useMemo(() => {
    const servers = Object.values(serversState.servers)
    return sortBy(servers, s => s.address)
  }, [serversState.servers])

  return (
    <>
      <Menu onClose={closeMenu} isOpen={isMenuOpen} position="left">
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
      </Menu>
    </>
  )
}

export default MainMenu
