import React from 'react'
import styled from 'styled-components'
import { useDebouncedCallback } from 'use-debounce'
import {
  animated,
  useSpring,
  config as springConfig,
  interpolate
} from 'react-spring'
import { useDrag } from 'react-use-gesture'
import { clamp } from 'lodash-es'

import { colors } from '../../../utils/colors'
import { SensorType } from '../../../domain/Button'
import toPercentage from '../../../utils/toPercentage'
import scale from '../../../utils/scale'
import {
  DeviceDescription,
  DeviceInputData
} from '../../../../../common-types/device'
import { useServerConnectionByAddr } from '../../../context/SocketContext'

const Container = styled.div`
  height: 100%;
  position: relative;
`

const ThresholdBar = styled(animated.div)`
  background-color: ${colors.thresholdBar};
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  transform-origin: 50% 100%;
  will-change: transform;
`

const OverThresholdBar = styled(animated.div)`
  background-color: ${colors.overThresholdBar};
  left: 0;
  position: absolute;
  right: 0;
  bottom: 0;
  top: 0;
  transform-origin: 50% 100%;
  will-change: transform;
`

const Bar = styled(animated.div)`
  background-color: ${colors.sensorBarColor};
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  transform-origin: 50% 100%;
  will-change: transform;
`

const ThumbContainer = styled(animated.div)`
  display: flex;
  justify-content: center;
  left: 50%;
  padding-bottom: ${scale(2)};
  padding-top: ${scale(2)};
  position: absolute;
  transform: translate(-50%, 50%);
  user-select: none;
  width: 100%;
`

const Thumb = styled(animated.div)`
  background-color: white;
  border-radius: 9999px;
  color: black;
  height: 100%;
  line-height: 1;
  padding: ${scale(1)} ${scale(1)};
  text-align: center;
  user-select: none;
`

interface Props {
  serverAddress: string
  device: DeviceDescription
  sensor: SensorType
  enableThresholdChange: boolean
}

const Sensor = React.memo<Props>(
  ({ serverAddress, device, sensor, enableThresholdChange }) => {
    const serverConnection = useServerConnectionByAddr(serverAddress)

    const containerRef = React.useRef<HTMLDivElement>(null)
    const currentlyDownRef = React.useRef<boolean>(false)

    const [{ value: sensorValue }, setSensorValue] = useSpring(() => ({
      value: 0,
      config: { ...springConfig.stiff, clamp: true }
    }))

    const handleInputEvent = React.useCallback(
      (inputData: DeviceInputData) => {
        const value = inputData.sensors[sensor.sensorIndex]

        setSensorValue({
          value
        })
      },
      [sensor.sensorIndex, setSensorValue]
    )

    React.useEffect(() => {
      if (!serverConnection) {
        return
      }

      return serverConnection.subscribeToInputEvents(
        device.id,
        handleInputEvent
      )
    }, [device.id, handleInputEvent, serverConnection])

    const [{ value: thresholdValue }, setThresholdValue] = useSpring(() => ({
      value: sensor.threshold
    }))

    // update threshold whenever it updates on state
    React.useEffect(() => {
      if (!currentlyDownRef.current) {
        setThresholdValue({ value: sensor.threshold, immediate: true })
      }
    }, [sensor.threshold, setThresholdValue])

    const thumbEnabledSpring = useSpring({
      opacity: enableThresholdChange ? 1 : 0,
      config: { duration: 100 }
    })

    const handleSensorThresholdUpdate = React.useCallback(
      (newThreshold: number, store: boolean) => {
        if (!serverConnection) {
          return
        }

        serverConnection.updateSensorThreshold(
          device.id,
          sensor.sensorIndex,
          newThreshold,
          store
        )
      },
      [device.id, sensor.sensorIndex, serverConnection]
    )

    const [
      throttledSensorUpdate,
      cancelThrottledSensorUpdate
    ] = useDebouncedCallback(handleSensorThresholdUpdate, 100, { maxWait: 250 })

    const bindThumb = useDrag(({ down, xy }) => {
      if (!containerRef.current || !enableThresholdChange) {
        return
      }

      const boundingRect = containerRef.current.getBoundingClientRect()
      const newValue = clamp(
        (boundingRect.height + boundingRect.top - xy[1]) / boundingRect.height,
        0,
        1
      )

      if (down) {
        setThresholdValue({ value: newValue, immediate: true })
        throttledSensorUpdate(newValue, false)
        currentlyDownRef.current = true
      } else {
        cancelThrottledSensorUpdate()
        setThresholdValue({ value: newValue, immediate: true })
        handleSensorThresholdUpdate(newValue, true)
        currentlyDownRef.current = false
      }
    })

    return (
      <Container ref={containerRef}>
        <ThresholdBar
          style={{
            transform: thresholdValue.interpolate(value => `scaleY(${value})`)
          }}
        />

        <Bar
          style={{
            transform: sensorValue.interpolate(value => `scaleY(${value})`)
          }}
        />

        <OverThresholdBar
          style={{
            transform: interpolate(
              [sensorValue, thresholdValue],
              (sensorValue, thresholdValue) => {
                const translateY = toPercentage(-thresholdValue)
                const scaleY = Math.max(sensorValue - thresholdValue, 0)
                return `translateY(${translateY}) scaleY(${scaleY})`
              }
            )
          }}
        />

        <ThumbContainer
          {...bindThumb()}
          style={{
            bottom: thresholdValue.interpolate(toPercentage),
            opacity: thumbEnabledSpring.opacity
          }}
        >
          <Thumb>
            {thresholdValue.interpolate(threshold =>
              (threshold * 100).toFixed(1)
            )}
          </Thumb>
        </ThumbContainer>
      </Container>
    )
  }
)

export default Sensor
