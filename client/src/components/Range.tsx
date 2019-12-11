import React, { useCallback } from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { smallText, basicText } from './Typography'
import scale from '../utils/scale'
import { colorValues } from '../utils/colors'

const Container = styled.div`
  align-items: center;
  border-radius: 999px;
  border: 1px solid white;
  display: flex;
  overflow: hidden;
`

const Button = styled.button`
  border: none;
  padding: ${scale(1)} ${scale(2)};
  color: ${colorValues.white};
  ${smallText};
  outline: none;

  &:disabled {
    opacity: 0.25;
  }
`

const Value = styled.span`
  flex-grow: 1;
  text-align: center;
  ${basicText};
`

interface Props {
  value: number
  valueText?: React.ReactNode
  min: number
  max: number
  onChange: (value: number) => void
}

const Range = React.memo<Props>(({ value, valueText, min, max, onChange }) => {
  const handleDecrement = useCallback(() => {
    onChange(value - 1)
  }, [onChange, value])

  const handleIncrement = useCallback(() => {
    onChange(value + 1)
  }, [onChange, value])

  return (
    <Container>
      <Button disabled={value <= min} type="button" onClick={handleDecrement}>
        <FontAwesomeIcon icon={faArrowLeft} size="1x"></FontAwesomeIcon>
      </Button>
      <Value>{valueText === undefined ? value : valueText}</Value>
      <Button disabled={value >= max} type="button" onClick={handleIncrement}>
        <FontAwesomeIcon icon={faArrowRight} size="1x"></FontAwesomeIcon>
      </Button>
    </Container>
  )
})

export default Range
