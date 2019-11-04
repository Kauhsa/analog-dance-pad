import React from 'react'
import { IconLookup } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styled from 'styled-components'

interface Props {
  icon: IconLookup
  size?: string
  color?: string
  onClick?: () => void
  className?: string
}

const Button = styled.button<{ size: string; color: string }>`
  border: none;
  outline: none;
  color: ${props => props.color};
  font-size: ${props => props.size};
  line-height: 1;
  padding: 0;
`

const IconButton = React.memo<Props>(
  ({ icon, size, color, onClick, className }) => (
    <Button
      size={size || '1em'}
      color={color || 'currentColor'}
      onClick={onClick}
      className={className}
    >
      <FontAwesomeIcon icon={icon} size="1x"></FontAwesomeIcon>
    </Button>
  )
)

export default IconButton
