import React from 'react'
import styled from 'styled-components'
import { faCheck } from '@fortawesome/free-solid-svg-icons'

import scale from '../../../utils/scale'
import IconButton from '../../../components/IconButton'
import { basicText } from '../../../components/Typography'

interface Props {
  onCalibrate: (calibrationBuffer: number) => void
}

const Container = styled.div`
  align-items: center;
  border-radius: 999px;
  display: flex;
  width: 100%;
`

const Slider = styled.input`
  flex: 1;
  height: ${scale(3)};
  appearance: none;
  width: 100%;
  border: none;
  padding: 0 ${scale(1)};
  outline: none;

  ::-webkit-slider-runnable-track {
    appearance: none;
    width: 100%;
    height: ${scale(1)};
    background-color: rgba(255, 255, 255, 0.33);
    border-radius: 999px;
  }

  ::-webkit-slider-thumb {
    appearance: none;
    height: ${scale(3)};
    width: ${scale(3)};
    margin-top: ${scale(-1)};
    border-radius: 100%;
    background-color: white;
    border: none;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.25);
  }
`

const CalibrationBuffer = styled.div`
  ${basicText};
  font-weight: bold;
  color: white;
  width: ${scale(4.5)};
  margin-left: ${scale(0.5)};
  line-height: 1;
  text-align: center;
`

const CheckButton = styled(IconButton).attrs({
  size: scale(2),
  icon: faCheck,
  color: 'white'
})`
  border: ${scale(0.25)} solid white;
  border-radius: 100%;
  padding: ${scale(0.75)};
  margin: 0 ${scale(1)};
`

const CalibrationSlider = React.memo<Props>(({ onCalibrate }) => {
  const [sliderValue, setSliderValue] = React.useState(0.05)

  const handleSliderValueChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSliderValue(parseFloat(e.target.value))
    },
    []
  )

  const handleCheckClick = React.useCallback(() => {
    onCalibrate(sliderValue)
  }, [onCalibrate, sliderValue])

  return (
    <Container>
      <CalibrationBuffer>{(sliderValue * 100).toFixed()}%</CalibrationBuffer>
      <Slider
        type="range"
        min={0}
        max={0.25}
        step={0.01}
        onChange={handleSliderValueChange}
        value={sliderValue}
      />
      <CheckButton onClick={handleCheckClick} />
    </Container>
  )
})

export default CalibrationSlider
