import React from 'react'
import Menu from '../../components/menu/Menu'
import TopBarButton from '../../components/topBar/TopBarButton'
import { faCog } from '@fortawesome/free-solid-svg-icons'
import MenuHeader from '../../components/menu/MenuHeader'

const DeviceConfiguration = React.memo<{}>(() => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  const openMenu = React.useCallback(() => {
    setIsMenuOpen(true)
  }, [setIsMenuOpen])

  const closeMenu = React.useCallback(() => {
    setIsMenuOpen(false)
  }, [setIsMenuOpen])

  return (
    <>
      <Menu isOpen={isMenuOpen} position="right" onClose={closeMenu}>
        <MenuHeader>Configuration</MenuHeader>
      </Menu>
      <TopBarButton icon={faCog} onClick={openMenu} />
    </>
  )
})

export default DeviceConfiguration
