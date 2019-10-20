#include <stdbool.h>
#include <string.h>

#include "Config/DancePadConfig.h"
#include "ConfigStore.h"
#include "Pad.h"
#include "ADC.h"

#define MIN(a,b) ((a) < (b) ? a : b)

PadConfiguration PAD_CONF;

PadState PAD_STATE = { 
    .sensorValues = { [0 ... SENSOR_COUNT - 1] = 0 },
    .buttonsPressed = { [0 ... BUTTON_COUNT - 1] = false }
};

typedef struct {
    uint16_t sensorReleaseThresholds[SENSOR_COUNT];
    int8_t buttonToSensorMap[BUTTON_COUNT][SENSOR_COUNT + 1];
} InternalPadConfiguration;

InternalPadConfiguration INTERNAL_PAD_CONF;

void Pad_UpdateInternalConfiguration(void) {
    for (int i = 0; i < SENSOR_COUNT; i++) {
        INTERNAL_PAD_CONF.sensorReleaseThresholds[i] = PAD_CONF.sensorThresholds[i] * PAD_CONF.releaseMultiplier;
    }

    // Precalculate array for mapping buttons to sensors.
    // For every button, there is an array of sensor indices. when there are no more buttons assigned to that sensor,
    // the value is -1.
    for (int buttonIndex = 0; buttonIndex < BUTTON_COUNT; buttonIndex++) {
        int mapIndex = 0;

        for (int sensorIndex = 0; sensorIndex < SENSOR_COUNT; sensorIndex++) {
            if (PAD_CONF.sensorToButtonMapping[sensorIndex] == buttonIndex) {
                INTERNAL_PAD_CONF.buttonToSensorMap[buttonIndex][mapIndex++] = sensorIndex;
            }
        }

        // mark -1 to end
        INTERNAL_PAD_CONF.buttonToSensorMap[buttonIndex][mapIndex] = -1;
    }
}

void Pad_Initialize(const PadConfiguration* padConfiguration) {
    ADC_Init();
    Pad_UpdateConfiguration(padConfiguration);
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

    for (int i = 0; i < BUTTON_COUNT; i++) {
        bool newButtonPressedState = false;

        for (int j = 0; j < SENSOR_COUNT; j++) {
            int8_t sensor = INTERNAL_PAD_CONF.buttonToSensorMap[i][j];
            
            if (sensor == -1) {
                break;
            }

            if (sensor < 0 || sensor > SENSOR_COUNT) {
                break;
            }

            uint16_t sensorVal = PAD_STATE.sensorValues[sensor];

            if (PAD_STATE.buttonsPressed[i]) {
                if (sensorVal > INTERNAL_PAD_CONF.sensorReleaseThresholds[sensor]) {
                    newButtonPressedState = true;
                    break;
                }
            } else {
                if (sensorVal > PAD_CONF.sensorThresholds[sensor]) {
                    newButtonPressedState = true;
                    break;
                }
            }
        }

        PAD_STATE.buttonsPressed[i] = newButtonPressedState;
    }
}
