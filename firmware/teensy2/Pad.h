#ifndef _PAD_H_
#define _PAD_H_
    #include <stdint.h>
    #include <stdbool.h>
    #include "Config/DancePadConfig.h"

    typedef struct {
        uint16_t sensorThresholds[SENSOR_COUNT];
        float releaseMultiplier;
    } __attribute__((packed)) PadConfiguration;

    typedef struct {
        uint16_t sensorValues[SENSOR_COUNT];
        bool buttonsPressed[BUTTON_COUNT];
    } PadState;

    void Pad_Initialize(void);
    void Pad_UpdateState(void);
    void Pad_UpdateConfiguration(const PadConfiguration* padConfiguration);

    extern PadConfiguration PAD_CONF;
    extern PadState PAD_STATE;
#endif
