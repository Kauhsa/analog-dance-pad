import React from 'react'
import styled from 'styled-components'
import { sortBy } from 'lodash-es'

import scale from '../../utils/scale'
import MenuServer from './MenuServer'
import Menu from '../menu/Menu'
import MenuHeader from '../menu/MenuHeader'
import useServerStore from '../../stores/useServerStore'
import useMainMenuStore from '../../stores/useMainMenuStore'

const ServersContainer = styled.div`
  > * {
    margin-bottom: ${scale(5)};
  }
`

const MainMenu = () => {
  const { isMenuOpen, closeMenu } = useMainMenuStore()
  const servers = useServerStore(store => store.servers)

  const sortedServers = React.useMemo(
    () => sortBy(Object.values(servers), s => s.address),
    [servers]
  )

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
