#include <stdbool.h>
#include "Config/DancePadConfig.h"
#include "Pad.h"

PadConfiguration PAD_CONFIGURATION = {
    .sensorThresholds = { [0 ... SENSOR_COUNT - 1] = 400 },
    .basePressure = 0,
    .releaseMultiplier = 0.9hk,
    .oldValueWeight = 1hk
};

PadState PAD_STATE = { 
    .sensorValues = { [0 ... SENSOR_COUNT - 1] = 0 },
    .buttonsPressed = { [0 ... BUTTON_COUNT - 1] = false }
};

void Pad_UpdateState(const uint16_t newValues[SENSOR_COUNT]) {
    short accum oldValueWeight = PAD_CONFIGURATION.oldValueWeight;

    for (int i = 0; i < SENSOR_COUNT; i++) {
        uint16_t prevValue = PAD_STATE.sensorValues[i];
        // believe it or not, this IS faster than just "/ (oldValueWeight + 1)"
        PAD_STATE.sensorValues[i] = (prevValue * oldValueWeight + newValues[i]) * (1 / (oldValueWeight + 1));
    }

    short accum releaseMultiplier = PAD_CONFIGURATION.releaseMultiplier;

    // TODO: No special button to sensor mapping for now. "Extra" sensors are ignored.
    for (int i = 0; i < BUTTON_COUNT; i++) {
        uint16_t threshold = PAD_CONFIGURATION.sensorThresholds[i];
        uint16_t sensorValue = PAD_STATE.sensorValues[i];
        bool prevPressed = PAD_STATE.buttonsPressed[i];
        PAD_STATE.buttonsPressed[i] = sensorValue > threshold || (prevPressed && sensorValue > (threshold * releaseMultiplier));
    }
}
