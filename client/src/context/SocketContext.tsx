import React from 'react'
import io from 'socket.io-client'
import { pull } from 'lodash-es'

import {
  DevicesUpdatedEvent,
  DeviceInputEvent,
  UpdateConfigurationEvent,
  SubscribeToDeviceEvent,
  UnsubscribeFromDeviceEvent
} from '../../../common-types/messages'
import {
  useServerState,
  ServerState,
  ServerStatus
} from '../stateHooks/useServerState'
import { DeviceConfiguration } from '../../../common-types/device'

interface ContextValue {
  servers: { [serverAddress: string]: ServerState }

  subscribeToInputEvents: (
    serverAddress: string,
    deviceId: string,
    callback: (data: DeviceInputEvent) => void
  ) => () => void

  updateConfiguration: (
    serverAddress: string,
    deviceId: string,
    configuration: Partial<DeviceConfiguration>
  ) => void

  updateSensorThreshold: (
    serverAddress: string,
    deviceId: string,
    sensorIndex: number,
    newThreshold: number
  ) => void
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
        const subscribeToDeviceEvent: SubscribeToDeviceEvent = { deviceId }
        server.socket.emit('subscribeToDevice', subscribeToDeviceEvent)
        server.inputEventSubscribers[deviceId] = [callback]
      }

      // unsubscribe callback
      return () => {
        if (server.inputEventSubscribers[deviceId] === undefined) {
          return
        }

        pull(server.inputEventSubscribers[deviceId], callback)

        if (server.inputEventSubscribers[deviceId].length === 0) {
          const unsubscribeFromDeviceEvent: UnsubscribeFromDeviceEvent = {
            deviceId
          }
          server.socket.emit(
            'unsubscribeFromDevice',
            unsubscribeFromDeviceEvent
          )
          delete server.inputEventSubscribers[deviceId]
        }
      }
    },
    [serverObjects]
  )

  const updateConfiguration: ContextValue['updateConfiguration'] = React.useCallback(
    (serverAddress, deviceId, configuration) => {
      const server = serverObjects[serverAddress]

      if (!server) {
        throw new Error('Unknown server!')
      }

      const updateConfigurationEvent: UpdateConfigurationEvent = {
        deviceId,
        configuration
      }

      server.socket.emit('updateConfiguration', updateConfigurationEvent)
    },
    [serverObjects]
  )

  const updateSensorThreshold: ContextValue['updateSensorThreshold'] = React.useCallback(
    (serverAddress, deviceId, sensorIndex, newThreshold) => {
      const server = serversState.servers[serverAddress]

      if (!server) {
        throw new Error('Unknown server!')
      }

      if (server.type !== ServerStatus.Connected) {
        throw new Error('Not connected to server!')
      }

      const device = server.devices.find(d => d.id === deviceId)

      if (!device) {
        throw new Error('No such device!')
      }

      const newThresholds = [...device.configuration.sensorThresholds]
      newThresholds[sensorIndex] = newThreshold

      updateConfiguration(serverAddress, deviceId, {
        sensorThresholds: newThresholds
      })
    },
    [serversState.servers, updateConfiguration]
  )

  const contextValue = React.useMemo(
    () => ({
      servers: serversState.servers,
      subscribeToInputEvents,
      updateConfiguration,
      updateSensorThreshold
    }),
    [
      serversState.servers,
      subscribeToInputEvents,
      updateConfiguration,
      updateSensorThreshold
    ]
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
