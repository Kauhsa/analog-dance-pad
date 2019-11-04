import React from 'react'
import styled from 'styled-components'
import scale from '../utils/scale'
import { useMenuContext } from '../context/MenuContext'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { largeText } from './Typography'
import IconButton from './IconButton'
import { colors } from '../utils/colors'

interface Props {
  title?: React.ReactNode
}

const Container = styled.div`
  height: ${scale(7)};
  display: flex;
  align-items: center;
  color: ${colors.text};
`

const OpenMenuButton = styled(IconButton)`
  flex-shrink: 1;
  padding: ${scale(2)};
`

const Title = styled.h1`
  ${largeText};
  line-height: 1;
`

const TopBar = React.memo<Props>(({ title }) => {
  const { openMenu } = useMenuContext()

  return (
    <Container>
      <OpenMenuButton onClick={openMenu} icon={faBars} size={scale(2.75)} />
      <Title>{title}</Title>
    </Container>
  )
})

export default TopBar
