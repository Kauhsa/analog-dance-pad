#ifndef _COMMUNICATION_H_
#define _COMMUNICATION_H_

    #include <stdint.h>
    #include "Config/DancePadConfig.h"
    #include "Pad.h"

    // small helper macro to do x / y, but rounded up instead of floored.
    #define CEILING(x,y) (((x) + (y) - 1) / (y))

    //
    // INPUT REPORTS
    // ie. from microcontroller to computer
    //

    typedef struct {
        uint8_t buttons[CEILING(BUTTON_COUNT, 8)];
        uint16_t sensorValues[SENSOR_COUNT];
    } __attribute__((packed)) InputHIDReport;

    //
    // FEATURE REPORTS
    // ie. can be requested by computer and written by computer
    //

    typedef struct {
        PadConfiguration configuration;
    } __attribute__((packed)) PadConfigurationFeatureHIDReport;

    void Communication_WriteInputHIDReport(InputHIDReport* report);
#endif