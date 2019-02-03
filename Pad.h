#ifndef _PAD_H_
#define _PAD_H_
    #include <stdint.h>
    #include <stdfix.h>
    #include <stdbool.h>
    #include "Config/DancePadConfig.h"

    typedef struct {
        uint16_t sensorThresholds[SENSOR_COUNT];
        uint16_t basePressure;
        short accum releaseMultiplier;
        short accum oldValueWeight;
    } PadConfiguration;

    typedef struct {
        uint16_t sensorValues[SENSOR_COUNT];
        bool buttonsPressed[BUTTON_COUNT];
    } PadState;

    void Pad_UpdateState(const uint16_t newValues[SENSOR_COUNT]);

    extern PadConfiguration PAD_CONFIGURATION;
    extern PadState PAD_STATE;
#endif
