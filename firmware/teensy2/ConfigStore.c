#include <string.h>
#include <stdint.h>
#include <util/atomic.h>
#include <avr/eeprom.h>

#include "Config/DancePadConfig.h"
#include "Pad.h"
#include "ConfigStore.h"

// just some random bytes to figure out what we have in eeprom
// change these to reset configuration!
static const uint8_t magicBytes[5] = {9, 74, 9, 48, 99};

// where magic bytes (which indicate that a pad configuration is, in fact, stored) exist
#define MAGIC_BYTES_ADDRESS ((void *) 0x00)

// where actual configration is stored
#define CONFIGURATION_ADDRESS ((void *) (MAGIC_BYTES_ADDRESS + sizeof (magicBytes)))

#define DEFAULT_NAME "Untitled Pad Device"

static const Configuration DEFAULT_CONFIGURATION = {
    .padConfiguration = {
        .sensorThresholds = { [0 ... SENSOR_COUNT - 1] = 400 },
        .releaseMultiplier = 0.9,
        .sensorToButtonMapping = { [0 ... SENSOR_COUNT - 1] = 1 }
    },
    .nameAndSize = {
        .size = sizeof(DEFAULT_NAME) - 1, // we don't care about the null at the end.
        .name = DEFAULT_NAME
    }
};

void ConfigStore_LoadConfiguration(Configuration* conf) {
    ATOMIC_BLOCK(ATOMIC_RESTORESTATE) {
        // see if we have magic bytes stored
        uint8_t magicByteBuffer[sizeof (magicBytes)];
        eeprom_read_block(magicByteBuffer, MAGIC_BYTES_ADDRESS, sizeof (magicBytes));

        if (memcmp(magicByteBuffer, magicBytes, sizeof (magicBytes)) == 0) {
            // we had magic bytes, let's load the configuration!
            eeprom_read_block(conf, CONFIGURATION_ADDRESS, sizeof (Configuration));
        } else {
            // we had some garbage on magic byte address, let's just use the default configuration
            memcpy(conf, &DEFAULT_CONFIGURATION, sizeof (Configuration));
        }
    }
}

void ConfigStore_StoreConfiguration(const Configuration* conf) {
    ATOMIC_BLOCK(ATOMIC_RESTORESTATE) {
        eeprom_update_block(conf, CONFIGURATION_ADDRESS, sizeof (Configuration));
        eeprom_update_block(magicBytes, MAGIC_BYTES_ADDRESS, sizeof (magicBytes));
    }
}
