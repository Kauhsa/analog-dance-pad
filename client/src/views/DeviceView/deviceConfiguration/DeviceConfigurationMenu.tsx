import React from 'react'
import Menu from '../../../components/menu/Menu'
import TopBarButton from '../../../components/topBar/TopBarButton'
import { faCog } from '@fortawesome/free-solid-svg-icons'
import MenuHeader from '../../../components/menu/MenuHeader'
import ConfigurationForm from './ConfigurationForm'
import {
  DeviceDescription,
  DeviceConfiguration
} from '../../../../../common-types/device'
import { useServerConnectionByAddr } from '../../../context/SocketContext'

interface Props {
  serverAddr: string
  device: DeviceDescription
}

const DeviceConfigurationMenu = React.memo<Props>(({ device, serverAddr }) => {
  const serverConnection = useServerConnectionByAddr(serverAddr)

  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  const openMenu = React.useCallback(() => {
    setIsMenuOpen(true)
  }, [setIsMenuOpen])

  const closeMenu = React.useCallback(() => {
    setIsMenuOpen(false)
  }, [setIsMenuOpen])

  const handleSubmit = React.useCallback(
    (conf: Partial<DeviceConfiguration>) => {
      if (!serverConnection) {
        return
      }

      serverConnection.updateConfiguration(device.id, conf)
      closeMenu()
    },
    [closeMenu, device.id, serverConnection]
  )

  return (
    <>
      <Menu isOpen={isMenuOpen} position="right" onClose={closeMenu}>
        <MenuHeader>Configuration</MenuHeader>
        <ConfigurationForm device={device} onSubmit={handleSubmit} />
      </Menu>
      <TopBarButton icon={faCog} onClick={openMenu} />
    </>
  )
})

export default DeviceConfigurationMenu
