const HID = require('node-hid');

// vendor
const VENDOR_ID = 0x03EB;
const PRODUCT_ID = 0x204F;

function readHidDevice(device) {
  return new Promise((resolve, reject) => {
    device.read((err, data) => {
      if (err) {
        reject(err);
        return
      }

      resolve(data);
    })
  })
}

async function main() {
  const device = new HID.HID(VENDOR_ID, PRODUCT_ID);

  let counter = 0;
  console.time('1000 packets')

  while (true) {
    const data = await readHidDevice(device);

    /* remove comment to log sensor data */
    /*
    let sensors = []
    for (let i = 0; i < 8; i++) {
      sensors.push(data.readUInt16BE((i * 2) + 2))
    }
    console.log(sensors)
    */

    counter++;
    
    if (counter >= 1000) {
      console.timeEnd('1000 packets')
      counter = 0;
      console.time('1000 packets')

      // first index in the array is record ID
      device.write(Math.random() > 0.5 ? [2, 0b11110000] : [2, 0b00001111])
    }
  }
}

main().catch(e => console.error(e));