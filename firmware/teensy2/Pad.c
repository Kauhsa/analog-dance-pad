#include <stdbool.h>
#include <string.h>

#include "Config/DancePadConfig.h"
#include "Pad.h"
#include "ADC.h"

#define MIN(a,b) ((a) < (b) ? a : b)

PadConfiguration PAD_CONF = {
    .sensorThresholds = { [0 ... SENSOR_COUNT - 1] = 400 },
    .releaseMultiplier = 0.9
};

PadState PAD_STATE = { 
    .sensorValues = { [0 ... SENSOR_COUNT - 1] = 0 },
    .buttonsPressed = { [0 ... BUTTON_COUNT - 1] = false }
};

typedef struct {
    uint16_t sensorReleaseThresholds[SENSOR_COUNT];
} InternalPadConfiguration;

InternalPadConfiguration INTERNAL_PAD_CONF;

void Pad_UpdateInternalConfiguration(void) {
    for (int i = 0; i < SENSOR_COUNT; i++) {
        INTERNAL_PAD_CONF.sensorReleaseThresholds[i] = PAD_CONF.sensorThresholds[i] * PAD_CONF.releaseMultiplier;
    }
}

void Pad_Initialize(void) {
    ADC_Init();
    Pad_UpdateInternalConfiguration();
}

void Pad_UpdateConfiguration(const PadConfiguration* padConfiguration) {
    memcpy(&PAD_CONF, padConfiguration, sizeof (PadConfiguration));
    Pad_UpdateInternalConfiguration();
}

void Pad_UpdateState(void) {
    uint16_t newValues[SENSOR_COUNT]; 
    
    for (int i = 0; i < SENSOR_COUNT; i++) {
        newValues[i] = ADC_Read(i);
    }
    
    for (int i = 0; i < SENSOR_COUNT; i++) {
        // TODO: weight of old value and new value is not configurable for now
        // because division by unknown value means ass performance.
        PAD_STATE.sensorValues[i] = (PAD_STATE.sensorValues[i] + newValues[i]) / 2;
    }

    // TODO: No special button to sensor mapping for now. "Extra" sensors are ignored.
    for (int i = 0; i < MIN(BUTTON_COUNT, SENSOR_COUNT); i++) {
        PAD_STATE.buttonsPressed[i] = PAD_STATE.buttonsPressed[i]
            ? PAD_STATE.sensorValues[i] > INTERNAL_PAD_CONF.sensorReleaseThresholds[i]
            : PAD_STATE.sensorValues[i] > PAD_CONF.sensorThresholds[i];
    }
}