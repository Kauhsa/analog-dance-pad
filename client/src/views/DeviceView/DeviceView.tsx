import React from 'react'
import IconAndTextPage from '../../components/IconAndTextPage'
import { faPoo, faPlug, faGamepad } from '@fortawesome/free-solid-svg-icons'
import Device from './Device'
import useServerStore, {
  ServerConnectionStatus,
  serverByAddr
} from '../../stores/useServerStore'

interface Props {
  serverId: string
  deviceId: string
}

const DeviceView: React.FC<Props> = ({ serverId, deviceId }) => {
  const server = useServerStore(serverByAddr(serverId))

  if (!server) {
    return <IconAndTextPage icon={faPoo}>Unknown server!</IconAndTextPage>
  }

  if (server.connectionStatus !== ServerConnectionStatus.Connected) {
    return (
      <IconAndTextPage icon={faPlug}>Not connected to server!</IconAndTextPage>
    )
  }

  const device = server.devices[deviceId]

  if (!device) {
    return (
      <IconAndTextPage icon={faGamepad}>
        No such device connected!
      </IconAndTextPage>
    )
  }

  return <Device serverAddress={server.address} device={device} />
}

export default DeviceView
