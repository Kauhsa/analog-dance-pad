import React from 'react'

import { useServerState, ServersState } from '../stateHooks/useServerState'
import ServerConnection from '../utils/ServerConnection'

interface ContextValue {
  serversState: ServersState
  serverConnections: ServerConnections
}

type ServerConnections = {
  [serverAddress: string]: ServerConnection
}

const SocketContext = React.createContext<ContextValue | null>(null)

interface ProviderProps {
  children: React.ReactNode
  serverAddresses: string[]
}

export const SocketContextProvider: React.FC<ProviderProps> = ({
  children,
  serverAddresses
}) => {
  const [serversState, dispatch] = useServerState(serverAddresses)
  const [serverConnections, setServerConnections] = React.useState<
    ServerConnections
  >({})

  React.useEffect(() => {
    const connections: ServerConnections = {}

    for (const address of serverAddresses) {
      connections[address] = new ServerConnection({
        address: address,
        onConnect: () => dispatch({ type: 'connect', address }),
        onDisconnect: () => dispatch({ type: 'disconnect', address }),
        onDevicesUpdated: devices =>
          dispatch({
            type: 'devicesUpdated',
            address,
            devices
          })
      })
    }

    setServerConnections(connections)
  }, [dispatch, serverAddresses])

  const contextValue = React.useMemo(
    () => ({
      serversState,
      serverConnections
    }),
    [serverConnections, serversState]
  )

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  )
}

export const useServerContext = () => {
  const serverContext = React.useContext(SocketContext)

  if (!serverContext) {
    throw new Error('Not inside SocketContextProvider')
  }

  return serverContext
}

export const useServerConnectionByAddr = (
  serverAddress: string
): ServerConnection | undefined => {
  const serverContext = useServerContext()
  return serverContext.serverConnections[serverAddress]
}
