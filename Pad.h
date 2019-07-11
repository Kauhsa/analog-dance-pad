#ifndef _PAD_H_
#define _PAD_H_
    #include <stdint.h>
    #include <stdbool.h>
    #include "Config/DancePadConfig.h"

    typedef struct {
        uint16_t sensorThresholds[SENSOR_COUNT];
        float releaseMultiplier;
    } UserPadConfiguration;

    typedef struct {
        uint16_t sensorReleaseThresholds[SENSOR_COUNT];
    } InternalPadConfiguration;

    typedef struct {
        uint16_t sensorValues[SENSOR_COUNT];
        bool buttonsPressed[BUTTON_COUNT];
    } PadState;

    void Pad_UpdateInternalConfiguration(void);
    void Pad_UpdateState(const uint16_t newValues[SENSOR_COUNT]);

    extern InternalPadConfiguration INTERNAL_PAD_CONF;
    extern UserPadConfiguration USER_PAD_CONF;
    extern PadState PAD_STATE;
#endif
