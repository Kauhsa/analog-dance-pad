import React from 'react'
import produce from 'immer'

import { DeviceDescriptionMap } from '../../../common-types/device'

export enum ServerConnectionStatus {
  Connected = 'connected',
  Disconnected = 'disconnected'
}

interface BaseServerState {
  address: string
  connectionStatus: ServerConnectionStatus
}

interface ConnectedServerState extends BaseServerState {
  connectionStatus: ServerConnectionStatus.Connected
  devices: DeviceDescriptionMap
}

interface DisconnectedServerState extends BaseServerState {
  connectionStatus: ServerConnectionStatus.Disconnected
}

export type ServerState = ConnectedServerState | DisconnectedServerState

type ServerReducerAction =
  | {
      type: 'connect'
      address: string
    }
  | {
      type: 'disconnect'
      address: string
    }
  | {
      type: 'devicesUpdated'
      address: string
      devices: DeviceDescriptionMap
    }

export type ServersState = {
  servers: { [serverAddress: string]: ServerState }
}

const serverReducer: React.Reducer<ServersState, ServerReducerAction> = produce(
  (draft: ServersState, action: ServerReducerAction) => {
    const address = action.address

    if (action.type === 'connect') {
      draft.servers[address] = {
        connectionStatus: ServerConnectionStatus.Connected,
        address: action.address,
        devices: {}
      }
    }

    if (action.type === 'disconnect') {
      draft.servers[address] = {
        connectionStatus: ServerConnectionStatus.Disconnected,
        address: action.address
      }
    }

    if (action.type === 'devicesUpdated') {
      const server = draft.servers[address]
      if (server.connectionStatus === ServerConnectionStatus.Connected) {
        server.devices = action.devices
      }
    }
  }
)

export const useServerState = (serverAddresses: string[]) => {
  const initialServerState = React.useMemo(
    () => ({
      servers: serverAddresses.reduce((acc, address) => {
        return {
          ...acc,
          [address]: {
            type: ServerConnectionStatus.Disconnected,
            address: address
          }
        }
      }, {})
    }),
    [serverAddresses]
  )

  const [serversState, dispatch] = React.useReducer(
    serverReducer,
    initialServerState
  )

  return [serversState, dispatch] as const
}
