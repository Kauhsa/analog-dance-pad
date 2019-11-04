import React from 'react'
import styled from 'styled-components'
import scale from '../utils/scale'
import { useMenuContext } from '../context/MenuContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { colors } from '../utils/colors'
import { largeText } from './Typography'

interface Props {
  title?: React.ReactNode
}

const Container = styled.div`
  height: ${scale(7)};
  display: flex;
  align-items: center;
`

const ButtonContainer = styled.button`
  border: none;
  outline: none;
  color: ${colors.text};
  flex-shrink: 1;
  font-size: ${scale(3)};
  padding: 0 ${scale(2)};
  line-height: 1;
`

const Title = styled.h1`
  ${largeText};
`

const TopBar = React.memo<Props>(({ title }) => {
  const { openMenu } = useMenuContext()

  return (
    <Container>
      <ButtonContainer onClick={openMenu}>
        <FontAwesomeIcon icon={faBars} />
      </ButtonContainer>
      <Title>{title}</Title>
    </Container>
  )
})

export default TopBar
