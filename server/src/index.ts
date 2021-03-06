import cors from 'cors'
import express from 'express'
import { Server as HttpServer } from 'http'
import SocketIO from 'socket.io'

import { Teensy2DeviceDriver } from './driver/teensy2/Teensy2DeviceDriver'
import createServer from './server'
import consola from 'consola'

function start(port: number, host: string) {
  const expressApplication = express()
  const httpServer = new HttpServer(expressApplication)
  const socketIOServer = SocketIO(httpServer, {
    perMessageDeflate: false,
    httpCompression: false,
    pingInterval: 2000,
    pingTimeout: 1000
  })
  expressApplication.use(cors())
  expressApplication.use(express.json())

  const closeServer = createServer({
    expressApplication,
    socketIOServer,
    deviceDrivers: [new Teensy2DeviceDriver()]
  })

  httpServer.listen(port, host, () =>
    consola.info(`Application started, listening ${host}:${port}`)
  )

  const stop = () => {
    closeServer()
    process.exit(0)
  }

  // this shouldn't be needed, but usb-detection library we're using is being
  // annoying. or something. figuring it out is TODO.
  process.on('SIGINT', stop)
  process.on('SIGTERM', stop)
}

const port = (process.env.PORT && parseInt(process.env.PORT, 10)) || 3333
const host = process.env.HOST || '0.0.0.0'
start(port, host)
