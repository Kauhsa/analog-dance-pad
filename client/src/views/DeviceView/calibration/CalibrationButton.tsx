import React from 'react'
import styled from 'styled-components'
import scale from '../../../utils/scale'
import { basicText } from '../../../components/Typography'

interface Props {
  onCalibrate: (calibrationBuffer: number) => void
  name: string
  calibrationBuffer: number
}

const Button = styled.div`
  ${basicText};
  display: block;
  color: black;
  background-color: white;
  padding: ${scale(1)};
  text-align: center;
  border-radius: 999px;
  transition: transform 200ms;
  transform: scale(1);

  &:active {
    transform: scale(0.9);
  }
`

const CalibrationButton = React.memo<Props>(
  ({ onCalibrate, name, calibrationBuffer }) => {
    const handleClick = React.useCallback(() => {
      onCalibrate(calibrationBuffer)
    }, [calibrationBuffer, onCalibrate])

    return (
      <Button onClick={handleClick}>
        {name} ({(calibrationBuffer * 100).toFixed()}%)
      </Button>
    )
  }
)

export default CalibrationButton
