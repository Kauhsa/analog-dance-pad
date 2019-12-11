import React from 'react'
import { useSpring } from 'react-spring'
import ServerConnection from './ServerConnection'
import { DeviceInputData } from '../../../common-types/device'

interface Settings {
  serverConnection: ServerConnection | undefined
  deviceId: string
  sensorIndex: number
}

// TODO: perhaps in the future the backend tells us the rate it sends inputevents
// so we can synchronize.
const BACKEND_EVENT_SENT_EVERY_MS = 1000 / 20

const useSensorValueSpring = ({
  serverConnection,
  deviceId,
  sensorIndex
}: Settings) => {
  const [{ value: sensorValue }, setSensorValue] = useSpring(() => ({
    value: 0,
    config: { duration: BACKEND_EVENT_SENT_EVERY_MS, clamp: true }
  }))

  const handleInputEvent = React.useCallback(
    (inputData: DeviceInputData) => {
      const value = inputData.sensors[sensorIndex]

      setSensorValue({
        value
      })
    },
    [sensorIndex, setSensorValue]
  )

  React.useEffect(() => {
    if (!serverConnection) {
      return
    }

    return serverConnection.subscribeToInputEvents(deviceId, handleInputEvent)
  }, [deviceId, handleInputEvent, serverConnection])

  return sensorValue
}

export default useSensorValueSpring
