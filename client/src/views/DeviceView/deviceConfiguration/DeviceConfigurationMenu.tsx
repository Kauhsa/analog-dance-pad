import React from 'react'
import Menu from '../../../components/menu/Menu'
import MenuHeader from '../../../components/menu/MenuHeader'
import ConfigurationForm from './ConfigurationForm'
import {
  DeviceDescription,
  DeviceConfiguration
} from '../../../../../common-types/device'

interface Props {
  serverAddress: string
  device: DeviceDescription
  isOpen: boolean
  onSave: (configuration: Partial<DeviceConfiguration>) => void
  onClose: () => void
}

const DeviceConfigurationMenu = React.memo<Props>(
  ({ device, onClose, onSave, isOpen, serverAddress }) => (
    <Menu isOpen={isOpen} position="right" onClose={onClose}>
      <MenuHeader>Configuration</MenuHeader>
      <ConfigurationForm
        serverAddress={serverAddress}
        device={device}
        onSubmit={onSave}
      />
    </Menu>
  )
)

export default DeviceConfigurationMenu
