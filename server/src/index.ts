import cors from 'cors'
import express from 'express'
import expressWs, { Application } from 'express-ws'

import { Teensy2DeviceDriver } from './driver/Teensy2DeviceDriver'
import { Server } from './server'

function start(port: number, host: string) {
  // start API
  const app = (express() as unknown) as Application
  expressWs(app)
  app.use(cors())
  app.use(express.json())

  const server = new Server({ deviceDrivers: [new Teensy2DeviceDriver()] })
  app.use('/api', server.start())

  app.listen(port, host, () =>
    // tslint:disable-next-line no-console
    console.log(`Application started at ${host}:${port}`)
  )

  process.on('SIGINT', () => {
    server.close()
    process.exit(0)
  })
}

const port = (process.env.PORT && parseInt(process.env.PORT, 10)) || 3333
const host = process.env.HOST || '127.0.0.1'
start(port, host)
