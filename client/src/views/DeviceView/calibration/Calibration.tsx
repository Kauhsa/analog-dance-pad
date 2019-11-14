import React from 'react'
import styled from 'styled-components'
import { animated, useSpring } from 'react-spring'

import scale from '../../../utils/scale'
import config from '../../../config'
import CalibrationSlider from './CalibrationSlider'
import CalibrationButton from './CalibrationButton'
import { largeText } from '../../../components/Typography'

const CALIBRATION_BACKDROP_ZINDEX = 10

const CalibrationBackDrop = styled(animated.div)`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: ${CALIBRATION_BACKDROP_ZINDEX};
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.95),
    rgba(0, 0, 0, 0.3)
  );
  will-change: opacity, transform;
`

const CalibrationContainer = styled(animated.div)`
  left: 0;
  padding: ${scale(2)} ${scale(2)};
  pointer-events: none;
  position: fixed;
  right: 0;
  top: 0;
  will-change: opacity;
  z-index: ${CALIBRATION_BACKDROP_ZINDEX + 1};
`

const CalibrationButtons = styled.div`
  > * {
    margin-bottom: ${scale(1.5)};
  }
  margin-bottom: ${scale(4)};
`

const Header = styled.div`
  ${largeText};
  margin-bottom: ${scale(2)};
`

interface Props {
  isOpen: boolean
  onCancel: () => void
  onCalibrate: (calibrationBuffer: number) => void
}

const Calibration = React.memo<Props>(({ isOpen, onCalibrate, onCancel }) => {
  const calibrationBackdropStyle = useSpring({
    opacity: isOpen ? 1 : 0,
    pointerEvents: isOpen ? 'auto' : 'none',
    config: { mass: 1, tension: 400, friction: 30 }
  })

  const calibrationContainerStyle = useSpring({
    opacity: isOpen ? 1 : 0,
    transform: isOpen ? 'translateY(0%)' : 'translateY(-50%)',
    pointerEvents: isOpen ? 'auto' : 'none',
    config: { mass: 1, tension: 400, friction: 30 }
  })

  return (
    <>
      <CalibrationBackDrop
        style={calibrationBackdropStyle}
        onClick={onCancel}
      />
      <CalibrationContainer style={calibrationContainerStyle}>
        <Header>Calibrate all buttons to:</Header>
        <CalibrationButtons>
          {config.calibrationPresets.map((preset, i) => (
            <CalibrationButton
              key={i}
              onCalibrate={onCalibrate}
              name={preset.name}
              calibrationBuffer={preset.calibrationBuffer}
            />
          ))}
        </CalibrationButtons>
        <Header>...or set a custom value:</Header>
        <CalibrationSlider onCalibrate={onCalibrate} />
      </CalibrationContainer>
    </>
  )
})

export default Calibration
