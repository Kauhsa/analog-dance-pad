import React from 'react'
import { useServerContext } from '../../context/SocketContext'
import { ServerStatus } from '../../stateHooks/useServerState'
import DeviceButtons from './DeviceButtons/DeviceButtons'

interface Props {
  serverId: string
  deviceId: string
}

const DeviceView: React.FC<Props> = ({ serverId, deviceId }) => {
  const serverContext = useServerContext()

  const server = serverContext.servers[serverId]

  if (!server) {
    return <p>Unknown server!</p>
  }

  if (server.type !== ServerStatus.Connected) {
    return <p>Not connected to server!</p>
  }

  const device = server.devices.find(device => device.id === deviceId)

  if (!device) {
    return <p>No such device on this server!</p>
  }

  return <DeviceButtons device={device} />
}

export default DeviceView
