import React from 'react'
import { useServerContext } from '../../context/SocketContext'
import { ServerConnectionStatus } from '../../stateHooks/useServerState'
import DeviceButtons from './DeviceButtons/DeviceButtons'
import IconAndTextPage from '../../components/IconAndTextPage'
import { faPoo, faPlug, faGamepad } from '@fortawesome/free-solid-svg-icons'

interface Props {
  serverId: string
  deviceId: string
}

const DeviceView: React.FC<Props> = ({ serverId, deviceId }) => {
  const serverContext = useServerContext()
  const server = serverContext.serversState.servers[serverId]

  if (!server) {
    return <IconAndTextPage icon={faPoo}>Unknown server!</IconAndTextPage>
  }

  if (server.connectionStatus !== ServerConnectionStatus.Connected) {
    return (
      <IconAndTextPage icon={faPlug}>Not connected to server!</IconAndTextPage>
    )
  }

  const device = server.devices.find(device => device.id === deviceId)

  if (!device) {
    return (
      <IconAndTextPage icon={faGamepad}>
        No such device connected!
      </IconAndTextPage>
    )
  }

  return <DeviceButtons serverAddress={serverId} device={device} />
}

export default DeviceView
