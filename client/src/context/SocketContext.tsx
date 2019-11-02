import React from 'react'
import io from 'socket.io-client'

import { DevicesUpdatedEvent } from '../../../common-types/messages'
import { useServerState, ServerState } from '../stateHooks/useServerState'

interface ContextValue {
  servers: { [serverAddress: string]: ServerState }
}

interface Props {
  children: React.ReactNode
  serverAddresses: string[]
}

const SocketContext = React.createContext<ContextValue | null>(null)

export const SocketContextProvider: React.FC<Props> = ({
  children,
  serverAddresses
}) => {
  const [serversState, dispatch] = useServerState(serverAddresses)

  React.useEffect(() => {
    for (const address of serverAddresses) {
      const socket = io(address, {
        transports: ['websocket']
      })

      socket.on('connect', () => {
        dispatch({ type: 'connect', address })
      })

      socket.on('disconnect', () => {
        dispatch({ type: 'disconnect', address })
      })

      socket.on('devicesUpdated', (e: DevicesUpdatedEvent) => {
        dispatch({ type: 'devicesUpdated', address, devices: e.devices })
      })
    }
  }, [])

  const contextValue = React.useMemo(
    () => ({
      servers: serversState.servers
    }),
    [serversState]
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
