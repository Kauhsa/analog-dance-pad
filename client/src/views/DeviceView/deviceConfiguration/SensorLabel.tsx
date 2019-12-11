import React from 'react'
import useSensorValueSpring from '../../../utils/useSensorValueSpring'
import styled from 'styled-components'
import { animated } from 'react-spring'
import useServerStore, {
  serverConnectionByAddr
} from '../../../stores/useServerStore'
import { basicText } from '../../../components/Typography'
import scale from '../../../utils/scale'

interface Props {
  serverAddress: string
  deviceId: string
  sensorIndex: number
}

const LabelContainer = styled.div`
  display: block;
  position: relative;
  padding: ${scale(0.5)} ${scale(0.5)};
  margin-bottom: ${scale(0.75)};
  line-height: 1;
`

const Bar = styled(animated.div)`
  background-color: white;
  bottom: 0;
  display: block;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  transform-origin: 0% 50%;
  will-change: transform;
  opacity: 0.25;
`

const Value = styled.div`
  z-index: 1;
  ${basicText};
`

const SensorLabel = React.memo<Props>(
  ({ serverAddress, deviceId, sensorIndex }) => {
    const serverConnection = useServerStore(
      serverConnectionByAddr(serverAddress)
    )

    const sensorValue = useSensorValueSpring({
      serverConnection,
      deviceId: deviceId,
      sensorIndex: sensorIndex
    })

    return (
      <LabelContainer>
        <Bar
          style={{
            transform: sensorValue.interpolate(value => `scaleX(${value})`)
          }}
        />
        <Value>Sensor {sensorIndex + 1}</Value>
      </LabelContainer>
    )
  }
)

export default SensorLabel
