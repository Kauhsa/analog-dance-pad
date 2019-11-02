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
  const socketIOServer = SocketIO(httpServer, { perMessageDeflate: false, httpCompression: false })
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

  process.on('SIGINT', () => {
    closeServer()
    process.exit(0)
  })
}

const port = (process.env.PORT && parseInt(process.env.PORT, 10)) || 3333
const host = process.env.HOST || '127.0.0.1'
start(port, host)
