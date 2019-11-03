import React from 'react'
import io from 'socket.io-client'
import { pull } from 'lodash-es'

import {
  DevicesUpdatedEvent,
  DeviceInputEvent
} from '../../../common-types/messages'
import { useServerState, ServerState } from '../stateHooks/useServerState'

interface ContextValue {
  servers: { [serverAddress: string]: ServerState }
  subscribeToInputEvents: (
    serverAddress: string,
    deviceId: string,
    callback: (data: DeviceInputEvent) => void
  ) => () => void
}

interface Props {
  children: React.ReactNode
  serverAddresses: string[]
}

type ServerObjects = {
  [serverAddress: string]: {
    socket: SocketIOClient.Socket
    inputEventSubscribers: {
      [deviceId: string]: Array<(inputEvent: DeviceInputEvent) => void>
    }
  }
}

const SocketContext = React.createContext<ContextValue | null>(null)

export const SocketContextProvider: React.FC<Props> = ({
  children,
  serverAddresses
}) => {
  const [serversState, dispatch] = useServerState(serverAddresses)
  const [serverObjects, setServerObjects] = React.useState<ServerObjects>({})

  React.useEffect(() => {
    const localServerObjects: ServerObjects = {}

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

      socket.on('devicesUpdated', (event: DevicesUpdatedEvent) => {
        dispatch({ type: 'devicesUpdated', address, devices: event.devices })
      })

      socket.on('inputEvent', (event: DeviceInputEvent) => {
        const currentSubscribers =
          localServerObjects[address].inputEventSubscribers[event.deviceId]

        if (!currentSubscribers) {
          return
        }

        for (const subscriber of currentSubscribers) {
          subscriber(event)
        }
      })

      localServerObjects[address] = {
        socket,
        inputEventSubscribers: {}
      }

      setServerObjects(localServerObjects)
    }
  }, [dispatch, serverAddresses])

  const subscribeToInputEvents: ContextValue['subscribeToInputEvents'] = React.useCallback(
    (serverAddress, deviceId, callback) => {
      const server = serverObjects[serverAddress]

      if (!server) {
        return () => {}
      }

      if (server.inputEventSubscribers[deviceId] !== undefined) {
        server.inputEventSubscribers[deviceId].push(callback)
      } else {
        server.socket.emit('subscribeToDevice', { deviceId })
        server.inputEventSubscribers[deviceId] = [callback]
      }

      // unsubscribe callback
      return () => {
        if (server.inputEventSubscribers[deviceId] === undefined) {
          return
        }

        pull(server.inputEventSubscribers[deviceId], callback)

        if (server.inputEventSubscribers[deviceId].length === 0) {
          server.socket.emit('unsubscribeFromDevice', { deviceId })
          delete server.inputEventSubscribers[deviceId]
        }
      }
    },
    [serverObjects]
  )

  const contextValue = React.useMemo(
    () => ({
      servers: serversState.servers,
      subscribeToInputEvents: subscribeToInputEvents
    }),
    [serversState, subscribeToInputEvents]
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
