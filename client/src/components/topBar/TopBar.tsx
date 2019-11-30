import React from 'react'
import styled from 'styled-components'
import scale from '../../utils/scale'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { colors } from '../../utils/colors'
import TopBarButton from './TopBarButton'
import useMainMenuStore from '../../stores/useMainMenuStore'

interface Props {
  children?: React.ReactNode
}

const Container = styled.div`
  height: ${scale(7)};
  display: flex;
  align-items: center;
  color: ${colors.text};
`

const TopBar = React.memo<Props>(({ children }) => {
  const openMenu = useMainMenuStore(store => store.openMenu)

  return (
    <Container>
      <TopBarButton onClick={openMenu} icon={faBars} />
      {children}
    </Container>
  )
})

export default TopBar
