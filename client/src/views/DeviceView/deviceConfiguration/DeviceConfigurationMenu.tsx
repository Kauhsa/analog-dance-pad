import React from 'react'
import Menu from '../../../components/menu/Menu'
import MenuHeader from '../../../components/menu/MenuHeader'
import ConfigurationForm from './ConfigurationForm'
import {
  DeviceDescription,
  DeviceConfiguration
} from '../../../../../common-types/device'

interface Props {
  device: DeviceDescription
  isOpen: boolean
  onSave: (configuration: Partial<DeviceConfiguration>) => void
  onClose: () => void
}

const DeviceConfigurationMenu = React.memo<Props>(
  ({ device, onClose, onSave, isOpen }) => (
    <Menu isOpen={isOpen} position="right" onClose={onClose}>
      <MenuHeader>Configuration</MenuHeader>
      <ConfigurationForm device={device} onSubmit={onSave} />
    </Menu>
  )
)

export default DeviceConfigurationMenu
