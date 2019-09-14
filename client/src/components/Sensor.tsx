import React from 'react'
import styled from 'styled-components'
import { colors } from '../utils/colors'
import { SensorType } from '../domain/Button'
import toPercentage from '../utils/toPercentage'
import scale from '../utils/scale'
import { animated, useSpring, config as springConfig } from 'react-spring'
import { useDrag } from 'react-use-gesture'

const Container = styled.div`
  height: 100%;
  position: relative;
`

const ThresholdBar = styled.div`
  bottom: 0;
  left: 0;
  right: 0;
  position: absolute;
  border-radius: ${scale(0.2)} ${scale(0.2)} 0 0;
  background-color: ${colors.thresholdBar};
`

const OverThresholdBar = styled.div`
  background-color: ${colors.overThresholdBar};
  border-radius: ${scale(0.2)} ${scale(0.2)} 0 0;
  box-shadow: 0px 0px ${scale(1)} ${colors.overThresholdBar};
  left: 0;
  position: absolute;
  right: 0;
`

const Bar = styled.div`
  bottom: 0;
  left: 0;
  right: 0;
  border-radius: ${scale(0.2)} ${scale(0.2)} 0 0;
  position: absolute;
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
  sensor: SensorType
  enableThresholdChange: boolean
}

const Sensor = React.memo<Props>(({ sensor, enableThresholdChange }) => {
  const containerRef = React.useRef<HTMLDivElement>(null)

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
          height: toPercentage(sensor.value),
          background: `linear-gradient(
            to top,
            ${colors.sensorBarBottomColor} 0,
            ${colors.sensorBarTopColor} ${toPercentage(1 / sensor.value)}
          )`
        }}
      />

      <OverThresholdBar
        style={{
          display: sensor.value > sensor.threshold ? 'block' : 'none',
          bottom: toPercentage(sensor.threshold),
          height: toPercentage(sensor.value - sensor.threshold)
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
})

export default Sensor
