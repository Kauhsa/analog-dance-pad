import create from 'zustand'
import produce from 'immer'

import ServerConnection from '../utils/ServerConnection'
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

interface State {
  init: (serverAddresses: string[]) => void
  servers: { [serverAddress: string]: ServerState }
  serverConnections: { [serverAddress: string]: ServerConnection }
}

const [useServerStore] = create<State>(set => {
  const setAndProduce = (fn: (draft: State) => void) => set(produce(fn))

  const connect = (address: string) =>
    setAndProduce(draft => {
      draft.servers[address] = {
        connectionStatus: ServerConnectionStatus.Connected,
        address: address,
        devices: {}
      }
    })

  const disconnect = (address: string) =>
    setAndProduce(draft => {
      draft.servers[address] = {
        connectionStatus: ServerConnectionStatus.Disconnected,
        address: address
      }
    })

  const devicesUpdated = (address: string, devices: DeviceDescriptionMap) =>
    setAndProduce(draft => {
      const server = draft.servers[address]
      if (server.connectionStatus === ServerConnectionStatus.Connected) {
        server.devices = devices
      }
    })

  const init = (serverAddresses: string[]) => {
    const serverConnections = serverAddresses.reduce(
      (acc, address) => ({
        ...acc,
        [address]: new ServerConnection({
          address,
          onConnect: () => connect(address),
          onDisconnect: () => disconnect(address),
          onDevicesUpdated: devices => devicesUpdated(address, devices)
        })
      }),
      {}
    )

    const servers = serverAddresses.reduce(
      (acc, address) => ({
        ...acc,
        [address]: {
          type: ServerConnectionStatus.Disconnected,
          address
        }
      }),
      {}
    )

    set({
      servers,
      serverConnections
    })
  }

  return {
    init,
    servers: {},
    serverConnections: {}
  }
})

export const serverByAddr = (addr: string) => (
  state: State
): ServerState | undefined => state.servers[addr]

export const serverConnectionByAddr = (addr: string) => (
  state: State
): ServerConnection | undefined => state.serverConnections[addr]

export default useServerStore
