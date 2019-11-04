import React from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

import {
  ServerConnectionStatus,
  ServerState
} from '../../stateHooks/useServerState'
import scale from '../../utils/scale'
import { colors } from '../../utils/colors'
import { smallText, basicText } from '../Typography'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faServer } from '@fortawesome/free-solid-svg-icons'

interface Props {
  server: ServerState
  onDeviceClick: () => void
}

const ServerLabel = styled.h2`
  ${smallText}
  opacity: 0.75;
  padding: 0 ${scale(2)};

  > svg {
    margin-right: ${scale(1)};
  }
`

const DeviceLink = styled(NavLink)`
  ${basicText};
  display: block;
  margin-left: ${scale(2)};
  margin-bottom: ${scale(0.25)};
  padding: ${scale(1.5)} ${scale(2)};
  text-decoration: none;
  cursor: pointer;
  background-color: ${colors.menuItem};

  &.active {
    box-shadow: ${scale(-0.5)} 0 0 currentColor;
  }
`

const deviceUrl = (serverAddr: string, deviceId: string) =>
  `/${encodeURIComponent(serverAddr)}/${encodeURIComponent(deviceId)}`

const MenuServer = React.memo<Props>(({ server, onDeviceClick }) => {
  if (server.connectionStatus !== ServerConnectionStatus.Connected) {
    return null
  }

  return (
    <div>
      <ServerLabel>
        <FontAwesomeIcon icon={faServer} />
        {server.address}
      </ServerLabel>
      {server.devices.map(device => (
        <DeviceLink
          key={device.id}
          to={deviceUrl(server.address, device.id)}
          onClick={onDeviceClick}
        >
          {device.configuration.name}
        </DeviceLink>
      ))}
    </div>
  )
})

export default MenuServer
