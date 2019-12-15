# Analog Dance Pad

*NOTE: this project contains submodules. You should clone with ` --recurse-submodules` flag.*

For all your dance gaming needs that involve FSR (or perhaps other) sensors!

- **Firmware for Teensy 2.0**
  - Works as a HID joystick.
  - Returns analog values alongside ordinary HID joystick data.
  - Remembers configuration after power loss.

- **Socket.IO server**
  - Built with NodeJS/TypeScript.
  - Communicates with Teensy 2.0 devices via USB.
    - ...so the server needs to run on same computer your Teensy 2.0 devices are connected to.
  - Ability to communicate with multiple Teensy 2.0 devices.
    - Only running server instance required, even with multiple pads in one device!
  - Implements calibration logic and sensor value linearization.
  - Handles connecting and disconnecting devices on the fly.

- **Web application**
  - Built with React/TypeScript.
  - Optimized for mobile use.
  - Ability to communicate to multiple servers at the same time.
    - Very useful for multi-cabinet environments!

## Getting Started

*NOTE: Understand that everything is very much work in progress. Software is not in usable state for anyone else than the most adventurous!*

### Firmware

You need **AVR GCC** and **Make** to build the project.

```bash
cd firmware/teensy2/build
make
```

This results `AnalogDancePad.hex` in `build` folder that you can upload to Teensy 2.0 device using [Teensy Loader](https://www.pjrc.com/teensy/loader.html). If you have [Teensy Loader CLI](https://www.pjrc.com/teensy/loader_cli.html) in your PATH, you can also run `make install`.

*NOTE: After uploading this firmware to your device, Teensy tools cannot reset it anymore due to USB Serial interface not being available. This means you need to reset it yourself. Pressing the reset button in firmware does still work. You can also run `npm run reset-teensy` in `server` directory in case it's not convenient to access your Teensy physically.*

### Server

Server has been tested with NodeJS 12. You might need `libudev-dev` or similar package for your operating system in case `usb-detection` library doesn't have a prebuilt binary for you. 

For development, you can use:

```
cd server
npm install
npm run start
```

For production use:

```
npm run build
node dist/index.js
```

You can use `PORT` and `HOST` environment variables. Default port is 3333. If you're running the server on a Linux machine, I recommend setting up a systemd unit file.

### Client

In case of client, you need to build the common types first (server does it automatically). You also need to do this whenever you change these types.

```
cd common-types
npm install
npm run build
```

After that, you can run the client for development purposes like this:

```
cd client
npm install
npm run start
```

...and building production-ready files to `build/` folder like this:

```
npm run build
```

You can then serve these files, for example, using [Surge](https://surge.sh/).

#### Environment variables

You probably need to set some environment variables for the client to be useful. This configuration needs to be done *on build* – so pass there environment variables to either `npm run start` or `npm run build`.

- `REACT_APP_SERVER_ADDRESSES`
  - List of server addresses to connect separated by a comma.
  - Example: `196.168.1.10:3333,196.168.1.11:3333`
  - Default: `localhost:3333`

- `REACT_APP_CALIBRATION_PRESETS`
  - List of presets in calibration UI.
  - Default: `Sensitive:0.05,Normal:0.1,Stiff:0.15`

- `REACT_APP_FORCE_INSECURE`
  - Detect whether the client is accessed through HTTPS, and redirect to HTTP if it is.
    - Why? Well, sometimes you might want to deploy the client in Internet, because it's easy and you don't want to deal with your own HTTP server. However, many convenient website hosting services (such as [Surge](https://surge.sh/)) often automatically serve you HTTPS version of the site, or you just end up to the HTTPS version accidentally. Due to mixed-content security policies, you cannot access anything unsecured – such as servers in the local network – if you're accessing the client in HTTPS.
  - Disabled by default.
  - Set to `true` enable.

## Troubleshooting

### The UI shows more sensors than I have

The firmware reads all 12 ADC pins on the Teensy. You may get fake readings from pins that have no sensors plugged in and are not grounded. If pressing a sensor causes more than one value to go up:
  - Determine which pins are unused. You can use this [pinout](https://www.pjrc.com/teensy/card2a.pdf). The sensors follow the pin order, e.g. ADC0 = 1, ADC1 = 2...
  - Press settings and disable the corresponding sensors in the UI, or
  - Ground the unused inputs on the board.

## License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to [LUFA](http://www.fourwalledcubicle.com/LUFA.php) for making the Teensy 2 firmware possible!
- Thanks to Finnish dance gaming community for creating a great opportunity to tinker endlessly with software.
