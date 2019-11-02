import React from 'react'
import produce from 'immer'
import { DeviceState } from '../domain/Button'

enum ServerStatus {
  Connected = 'connected',
  Disconnected = 'disconnected'
}

interface BaseServerState {
  address: string
  type: ServerStatus
}

interface ConnectedServerState extends BaseServerState {
  type: ServerStatus.Connected
  devices: DeviceState[]
}

interface DisconnectedServerState extends BaseServerState {
  type: ServerStatus.Disconnected
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
      devices: DeviceState[]
    }

export type ServersState = {
  servers: { [serverAddress: string]: ServerState }
}

const serverReducer: React.Reducer<ServersState, ServerReducerAction> = produce(
  (draft: ServersState, action: ServerReducerAction) => {
    const address = action.address

    if (action.type === 'connect') {
      draft.servers[address] = {
        type: ServerStatus.Connected,
        address: action.address,
        devices: []
      }
    }

    if (action.type === 'disconnect') {
      draft.servers[address] = {
        type: ServerStatus.Disconnected,
        address: action.address
      }
    }

    if (action.type === 'devicesUpdated') {
      const server = draft.servers[address]
      if (server.type === ServerStatus.Connected) {
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
          [address]: { type: ServerStatus.Disconnected, address: address }
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
