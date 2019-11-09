import React from 'react'
import TopBar from '../../components/topBar/TopBar'
import TopBarTitle from '../../components/topBar/TopBarTitle'
import DeviceConfigurationMenu from './deviceConfiguration/DeviceConfigurationMenu'
import TopBarButton from '../../components/topBar/TopBarButton'
import Calibration from './calibration/Calibration'
import DeviceButtons from './deviceButtons/DeviceButtons'
import {
  DeviceDescription,
  DeviceConfiguration
} from '../../../../common-types/device'
import { faBalanceScale, faCog } from '@fortawesome/free-solid-svg-icons'
import { useServerConnectionByAddr } from '../../context/SocketContext'

interface Props {
  serverAddress: string
  device: DeviceDescription
}

const Device = React.memo<Props>(({ serverAddress, device }) => {
  const serverConnection = useServerConnectionByAddr(serverAddress)

  // configuration menu

  const [configurationMenuOpen, setConfigurationMenuOpen] = React.useState(
    false
  )

  const openConfigurationMenu = React.useCallback(() => {
    setConfigurationMenuOpen(true)
  }, [])

  const closeConfigurationMenu = React.useCallback(() => {
    setConfigurationMenuOpen(false)
  }, [])

  const handleSaveConfiguration = React.useCallback(
    (conf: Partial<DeviceConfiguration>) => {
      if (!serverConnection) {
        return
      }

      serverConnection.updateConfiguration(device.id, conf)
      closeConfigurationMenu()
    },
    [closeConfigurationMenu, device.id, serverConnection]
  )

  // calibration

  const handleStartCalibration = React.useCallback(() => {
    if (!serverConnection) {
      return
    }

    serverConnection.startOrUpdateCalibration(device.id, 0.1)
  }, [device.id, serverConnection])

  const handleSaveCalibration = React.useCallback(() => {
    if (!serverConnection) {
      return
    }

    serverConnection.saveCalibration(device.id)
  }, [device.id, serverConnection])

  const handleCancelCalibration = React.useCallback(() => {
    if (!serverConnection) {
      return
    }

    serverConnection.cancelCalibration(device.id)
  }, [device.id, serverConnection])

  const handleUpdateCalibration = React.useCallback(
    (value: number) => {
      if (!serverConnection) {
        return
      }

      serverConnection.startOrUpdateCalibration(device.id, value)
    },
    [device.id, serverConnection]
  )

  return (
    <>
      <DeviceConfigurationMenu
        device={device}
        isOpen={configurationMenuOpen}
        onSave={handleSaveConfiguration}
        onClose={closeConfigurationMenu}
      />

      <Calibration
        enabled={device.calibration !== null}
        calibrationBuffer={
          (device.calibration && device.calibration.calibrationBuffer) || 0
        }
        onSave={handleSaveCalibration}
        onCancel={handleCancelCalibration}
        onChange={handleUpdateCalibration}
      />

      <TopBar>
        <TopBarTitle>{device.configuration.name}</TopBarTitle>
        <TopBarButton icon={faBalanceScale} onClick={handleStartCalibration} />
        <TopBarButton icon={faCog} onClick={openConfigurationMenu} />
      </TopBar>

      <DeviceButtons serverAddress={serverAddress} device={device} />
    </>
  )
})

export default Device
