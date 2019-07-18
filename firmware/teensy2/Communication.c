#include <stdbool.h>

#include "Config/DancePadConfig.h"
#include "Communication.h"
#include "Pad.h"

static bool currentConfigurationRequested = false;

void Communication_ProcessInputReportRequest(InputHIDReport* report) {
    // first, update pad state
    Pad_UpdateState();

    // write buttons to the report. button state is always reported.
    for (int i = 0; i < BUTTON_COUNT; i++) {
        // trol https://stackoverflow.com/a/47990
        report->buttons[i / 8] ^= (-PAD_STATE.buttonsPressed[i] ^ report->buttons[i / 8]) & (1UL << i % 8);
    }

    if (currentConfigurationRequested) {
        // if there's previously been an output report to request configuration, return that.
        report->extraData.type = INPUT_REPORT_TYPE_CURRENT_CONFIGURATION;
        report->extraData.currentConfiguration = PAD_CONF;
        currentConfigurationRequested = false;
    } else {
        // otherwise, return sensor values.
        report->extraData.type = INPUT_REPORT_TYPE_SENSOR_VALUES;
        for (int i = 0; i < SENSOR_COUNT; i++) {
            report->extraData.sensorValues[i] = PAD_STATE.sensorValues[i];
        }
    }
}

void Communication_ProcessOutputReport(const OutputHIDReport* report) {
    if (report->type == OUTPUT_REPORT_TYPE_REQUEST_CURRENT_CONFIGURATION) {
        currentConfigurationRequested = true;
    } else if (report->type == OUTPUT_REPORT_TYPE_SET_NEW_CONFIGURATION) {
        Pad_UpdateConfiguration(&report->newConfiguration);
    }
}