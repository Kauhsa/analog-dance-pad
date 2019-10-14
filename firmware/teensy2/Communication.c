#include <stdbool.h>

#include "Config/DancePadConfig.h"
#include "Communication.h"
#include "Pad.h"

void Communication_WriteInputHIDReport(InputHIDReport* report) {
    // first, update pad state
    Pad_UpdateState();

    // write buttons to the report
    for (int i = 0; i < BUTTON_COUNT; i++) {
        // trol https://stackoverflow.com/a/47990
        report->buttons[i / 8] ^= (-PAD_STATE.buttonsPressed[i] ^ report->buttons[i / 8]) & (1UL << i % 8);
    }
   
    // write sensor values to the report
    for (int i = 0; i < SENSOR_COUNT; i++) {
        report->sensorValues[i] = PAD_STATE.sensorValues[i];
    }
}