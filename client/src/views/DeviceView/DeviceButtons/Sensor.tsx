import React from 'react'
import styled from 'styled-components'
import { colors } from '../../../utils/colors'
import { SensorType } from '../../../domain/Button'
import toPercentage from '../../../utils/toPercentage'
import scale from '../../../utils/scale'
import { animated, useSpring, config as springConfig } from 'react-spring'
import { useDrag } from 'react-use-gesture'
import { DeviceDescription } from '../../../../../common-types/device'
import { DeviceInputEvent } from '../../../../../common-types/messages'
import { useServerContext } from '../../../context/SocketContext'

const Container = styled.div`
  height: 100%;
  position: relative;
`

const ThresholdBar = styled.div`
  bottom: 0;
  left: 0;
  right: 0;
  position: absolute;
  background-color: ${colors.thresholdBar};
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

const Thumb = styled(animated.div)`
  position: absolute;
  border-radius: 9999px;
  color: white;
  text-align: center;
  line-height: 1;
  transform: translate(-50%, 50%);
  background-color: white;
  left: 50%;
  color: black;
  user-select: none;
  padding: ${scale(1)} ${scale(1)};
`

interface Props {
  serverAddress: string
  device: DeviceDescription
  sensor: SensorType
  enableThresholdChange: boolean
}

const Sensor = React.memo<Props>(
  ({ serverAddress, device, sensor, enableThresholdChange }) => {
    const serverContext = useServerContext()
    const containerRef = React.useRef<HTMLDivElement>(null)

    const [{ value: sensorValue }, setSensorValue] = useSpring(() => ({
      value: 0,
      config: { ...springConfig.stiff, clamp: true }
    }))

    const handleInputEvent = React.useCallback(
      (inputEvent: DeviceInputEvent) => {
        const value = inputEvent.inputData.sensors[sensor.sensorIndex]

        setSensorValue({
          value
        })
      },
      [sensor]
    )

    React.useEffect(
      () =>
        serverContext.subscribeToInputEvents(
          serverAddress,
          device.id,
          handleInputEvent
        ),
      [serverAddress, device, serverContext, handleInputEvent]
    )

    const [thresholdSpring, setThresholdSpring] = useSpring(() => ({
      value: sensor.threshold
    }))

    const thumbEnabledSpring = useSpring({
      opacity: enableThresholdChange ? 1 : 0,
      config: springConfig.stiff
    })

    const bindThumb = useDrag(({ down, xy }) => {
      if (!containerRef.current || !enableThresholdChange) {
        return
      }

      const boundingRect = containerRef.current.getBoundingClientRect()
      const newValue =
        (boundingRect.height + boundingRect.top - xy[1]) / boundingRect.height

      if (down) {
        setThresholdSpring({
          value: newValue,
          immediate: true
        })
      } else {
        setThresholdSpring({
          value: sensor.threshold,
          immediate: false
        })
      }
    })

    return (
      <Container ref={containerRef}>
        <ThresholdBar style={{ height: toPercentage(sensor.threshold) }} />

        <Bar
          style={{
            transform: sensorValue.interpolate(value => `scaleY(${value})`)
          }}
        />

        <OverThresholdBar
          style={{
            display: sensorValue.interpolate(value =>
              value > sensor.threshold ? 'block' : 'none'
            ),
            transform: sensorValue.interpolate(
              value =>
                `translateY(${toPercentage(-sensor.threshold)}) scaleY(${value -
                  sensor.threshold})`
            )
          }}
        />

        <Thumb
          {...bindThumb()}
          style={{
            bottom: thresholdSpring.value.interpolate(toPercentage),
            opacity: thumbEnabledSpring.opacity
          }}
        >
          {thresholdSpring.value.interpolate(threshold =>
            (threshold * 100).toFixed(1)
          )}
        </Thumb>
      </Container>
    )
  }
)

export default Sensor
