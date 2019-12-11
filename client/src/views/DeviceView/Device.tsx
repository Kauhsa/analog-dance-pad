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
import useServerStore, {
  serverConnectionByAddr
} from '../../stores/useServerStore'
import TopBarSubtitle from '../../components/topBar/TopBarSubtitle'

interface Props {
  serverAddress: string
  device: DeviceDescription
}

const Device = React.memo<Props>(({ serverAddress, device }) => {
  const serverConnection = useServerStore(serverConnectionByAddr(serverAddress))

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

      serverConnection.updateConfiguration(device.id, conf, true)
      closeConfigurationMenu()
    },
    [closeConfigurationMenu, device.id, serverConnection]
  )

  // calibration

  const [calibrationMenuOpen, setCalibrationMenuOpen] = React.useState(false)

  const openCalibrationMenu = React.useCallback(() => {
    setCalibrationMenuOpen(true)
  }, [])

  const closeCalibrationMenu = React.useCallback(() => {
    setCalibrationMenuOpen(false)
  }, [])

  const handleCalibrate = React.useCallback(
    (calibrationBuffer: number) => {
      if (!serverConnection) {
        return
      }

      serverConnection.calibrate(device.id, calibrationBuffer)
      setTimeout(closeCalibrationMenu, 100)
    },
    [closeCalibrationMenu, device.id, serverConnection]
  )

  const eventRateFieldRef = React.useRef<HTMLSpanElement>(null)

  const handleEventRateUpdate = React.useCallback((rate: number) => {
    if (!eventRateFieldRef.current) {
      return
    }

    eventRateFieldRef.current.innerText = rate + ' Hz'
  }, [])

  React.useEffect(() => {
    if (!serverConnection) {
      return
    }

    return serverConnection.subscribeToRateEvents(
      device.id,
      handleEventRateUpdate
    )
  }, [device.id, handleEventRateUpdate, serverConnection])

  return (
    <>
      <DeviceConfigurationMenu
        device={device}
        serverAddress={serverAddress}
        isOpen={configurationMenuOpen}
        onSave={handleSaveConfiguration}
        onClose={closeConfigurationMenu}
      />

      <Calibration
        isOpen={calibrationMenuOpen}
        onCalibrate={handleCalibrate}
        onCancel={closeCalibrationMenu}
      />

      <TopBar>
        <TopBarTitle>
          {device.configuration.name}
          <TopBarSubtitle ref={eventRateFieldRef}></TopBarSubtitle>
        </TopBarTitle>
        <TopBarButton icon={faBalanceScale} onClick={openCalibrationMenu} />
        <TopBarButton icon={faCog} onClick={openConfigurationMenu} />
      </TopBar>

      <DeviceButtons serverAddress={serverAddress} device={device} />
    </>
  )
})

export default Device
