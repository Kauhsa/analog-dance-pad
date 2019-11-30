import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { isEmpty, map } from 'lodash'

import scale from '../../utils/scale'
import { colors } from '../../utils/colors'
import { smallText, basicText } from '../Typography'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faServer } from '@fortawesome/free-solid-svg-icons'
import {
  ServerConnectionStatus,
  ServerState
} from '../../stores/useServerStore'

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

const Message = styled.div`
  ${basicText};
  display: block;
  margin-left: ${scale(2)};
`

const deviceUrl = (serverAddr: string, deviceId: string) =>
  `/${encodeURIComponent(serverAddr)}/${encodeURIComponent(deviceId)}`

const MenuServer = React.memo<Props>(({ server, onDeviceClick }) => {
  // to properly update on location change.
  useLocation()

  return (
    <div>
      <ServerLabel>
        <FontAwesomeIcon icon={faServer} />
        {server.address}
      </ServerLabel>

      {server.connectionStatus === ServerConnectionStatus.Connected ? (
        isEmpty(server.devices) ? (
          <Message>No devices connected to server!</Message>
        ) : (
          map(server.devices, device => (
            <DeviceLink
              key={device.id}
              to={deviceUrl(server.address, device.id)}
              onClick={onDeviceClick}
            >
              {device.configuration.name}
            </DeviceLink>
          ))
        )
      ) : (
        <Message>Not connected to server!</Message>
      )}
    </div>
  )
})

export default MenuServer
