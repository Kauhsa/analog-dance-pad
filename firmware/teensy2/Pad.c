#include <stdbool.h>
#include "Config/DancePadConfig.h"
#include "Pad.h"

#define MIN(a,b) ((a) < (b) ? a : b)

UserPadConfiguration USER_PAD_CONF = {
    .sensorThresholds = { [0 ... SENSOR_COUNT - 1] = 400 },
    .releaseMultiplier = 0.9
};

PadState PAD_STATE = { 
    .sensorValues = { [0 ... SENSOR_COUNT - 1] = 0 },
    .buttonsPressed = { [0 ... BUTTON_COUNT - 1] = false }
};

InternalPadConfiguration INTERNAL_PAD_CONF;

void Pad_UpdateInternalConfiguration(void) {
    for (int i = 0; i < SENSOR_COUNT; i++) {
        INTERNAL_PAD_CONF.sensorReleaseThresholds[i] = USER_PAD_CONF.sensorThresholds[i] * USER_PAD_CONF.releaseMultiplier;
    }
}

void Pad_UpdateState(const uint16_t newValues[SENSOR_COUNT]) {
    for (int i = 0; i < SENSOR_COUNT; i++) {
        // TODO: weight of old value and new value is not configurable for now
        // because division by unknown value means ass performance.
        PAD_STATE.sensorValues[i] = (PAD_STATE.sensorValues[i] + newValues[i]) / 2;
    }

    // TODO: No special button to sensor mapping for now. "Extra" sensors are ignored.
    for (int i = 0; i < MIN(BUTTON_COUNT, SENSOR_COUNT); i++) {
        PAD_STATE.buttonsPressed[i] = PAD_STATE.buttonsPressed[i]
            ? PAD_STATE.sensorValues[i] > INTERNAL_PAD_CONF.sensorReleaseThresholds[i]
            : PAD_STATE.sensorValues[i] > USER_PAD_CONF.sensorThresholds[i];
    }
}
