import React from 'react'
import styled from 'styled-components'
import { animated, useSpring } from 'react-spring'

import scale from '../../../utils/scale'
import useFreeze from '../../../utils/useFreeze'
import IconButton from '../../../components/IconButton'
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'
import { largeText } from '../../../components/Typography'
import { useDebouncedCallback } from 'use-debounce/lib'

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
    rgba(0, 0, 0, 0.5) 0%,
    rgba(0, 0, 0, 0) 50%
  );
`

const CalibrationContainer = styled(animated.div)`
  left: 0;
  padding: 0 ${scale(2)};
  pointer-events: none;
  position: fixed;
  right: 0;
  top: ${scale(2)};
  z-index: ${CALIBRATION_BACKDROP_ZINDEX + 1};
  will-change: opacity;
`

const CalibrationBox = styled.div`
  align-items: center;
  background-color: white;
  border-radius: 999px;
  display: flex;
  height: ${scale(7)};
  padding: 0 ${scale(2)};
  width: 100%;
  will-change: opacity, transform;
`

const Slider = styled.input`
  flex: 1;
  height: ${scale(2)};
  appearance: none;
  width: 100%;
  border: none;
  padding: 0 ${scale(1)};
  outline: none;

  ::-webkit-slider-runnable-track {
    appearance: none;
    height: ${scale(0.5)};
    width: 100%;
    background-color: rgba(0, 0, 0, 0.25);
    border-radius: 999px;
  }

  ::-webkit-slider-thumb {
    appearance: none;
    margin-top: ${scale(-0.75)};
    height: ${scale(2)};
    width: ${scale(2)};
    border-radius: 100%;
    background-color: black;
  }
`

const CalibrationBuffer = styled.div`
  ${largeText};
  color: black;
  width: ${scale(4.5)};
  margin-left: ${scale(0.5)};
`

const CalibrationButton = styled(IconButton).attrs({
  size: scale(3)
})`
  margin: 0 ${scale(1)};
`

interface Props {
  enabled: boolean
  calibrationBuffer: number
  onCancel: () => void
  onSave: () => void
  onChange: (value: number) => void
}

const Calibration = React.memo<Props>(
  ({ enabled, calibrationBuffer, onSave, onCancel, onChange }) => {
    const [sliderValue, setSliderValue] = React.useState(calibrationBuffer)
    const isMovingSlider = React.useRef(false)

    React.useEffect(() => {
      if (!isMovingSlider) {
        setSliderValue(calibrationBuffer)
      }
    }, [calibrationBuffer, enabled])

    const handleUpdate = React.useCallback(
      (value: number) => {
        onChange(value)
      },
      [onChange]
    )

    const [debouncedChange, cancelDebouncedChange] = useDebouncedCallback(
      handleUpdate,
      100,
      { maxWait: 250 }
    )

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value)
        setSliderValue(value)
        debouncedChange(value)
      },
      [debouncedChange]
    )

    const handleStartChange = React.useCallback(() => {
      isMovingSlider.current = true
    }, [])

    const handleEndChange = React.useCallback(
      (e: any) => {
        isMovingSlider.current = false
        cancelDebouncedChange()
        handleUpdate(parseFloat(e.target.value))
      },
      [cancelDebouncedChange, handleUpdate]
    )

    const contents = enabled && (
      <CalibrationBox>
        <CalibrationBuffer>{(sliderValue * 100).toFixed(1)}</CalibrationBuffer>
        <Slider
          type="range"
          min={0}
          max={0.25}
          step={0.001}
          onChange={handleChange}
          value={sliderValue}
          onMouseUp={handleStartChange}
          onMouseDown={handleEndChange}
          onTouchStart={handleStartChange}
          onTouchEnd={handleEndChange}
        />
        <CalibrationButton icon={faCheck} onClick={onSave} color="green" />
        <CalibrationButton icon={faTimes} onClick={onCancel} color="red" />
      </CalibrationBox>
    )

    const calibrationBackdropStyle = useSpring({
      opacity: enabled ? 1 : 0,
      pointerEvents: enabled ? 'auto' : 'none',
      config: { mass: 1, tension: 400, friction: 30 }
    })

    const calibrationContainerStyle = useSpring({
      opacity: enabled ? 1 : 0,
      transform: enabled ? 'translateY(0%)' : 'translateY(-50%)',
      pointerEvents: enabled ? 'auto' : 'none',
      config: { mass: 1, tension: 400, friction: 30 }
    })

    return (
      <>
        <CalibrationBackDrop
          style={calibrationBackdropStyle}
          onClick={onCancel}
        />
        <CalibrationContainer style={calibrationContainerStyle}>
          {useFreeze(contents, !enabled)}
        </CalibrationContainer>
      </>
    )
  }
)

export default Calibration
