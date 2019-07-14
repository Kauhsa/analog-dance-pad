import { Teensy2DeviceDriver } from './driver/Teensy2DeviceDriver'

const teensyDriver = new Teensy2DeviceDriver()
teensyDriver.on('newDevice', () => console.log('new device found'))
teensyDriver.start()
