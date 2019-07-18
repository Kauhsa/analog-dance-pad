#ifndef _COMMUNICATION_H_
#define _COMMUNICATION_H_

    #include <stdint.h>
    #include "Config/DancePadConfig.h"
    #include "Pad.h"

    // small helper macro to do x / y, but rounded up instead of floored.
    #define CEILING(x,y) (((x) + (y) - 1) / (y))

    // Here, input means "input to computer", and output means "output from computer".

    //
    // INPUT REPORTS
    //

    typedef enum {
        INPUT_REPORT_TYPE_SENSOR_VALUES = 1,
        INPUT_REPORT_TYPE_CURRENT_CONFIGURATION = 2
    } InputReportExtraDataType;

    typedef struct {
        InputReportExtraDataType type;

        union {
            // INPUT_REPORT_TYPE_SENSOR_VALUES
            uint16_t sensorValues[SENSOR_COUNT];

            // INPUT_REPORT_TYPE_CURRENT_CONFIGURATION
            PadConfiguration currentConfiguration;
        };
    } __attribute__((packed)) InputHIDReportExtraData;

    typedef struct {
        uint8_t buttons[CEILING(BUTTON_COUNT, 8)];
        InputHIDReportExtraData extraData;
    } __attribute__((packed)) InputHIDReport;

    //
    // OUTPUT REPORTS
    //

    typedef enum {
        OUTPUT_REPORT_TYPE_REQUEST_CURRENT_CONFIGURATION = 1,
        OUTPUT_REPORT_TYPE_SET_NEW_CONFIGURATION = 2
    } OutputReportType;

    typedef struct {
        OutputReportType type;

        union {
            // OUTPUT_REPORT_TYPE_REQUEST_CURRENT_CONFIGURATION
            /* nothing! */

            // OUTPUT_REPORT_TYPE_SET_NEW_CONFIGURATION
            PadConfiguration newConfiguration;
        };
    } __attribute__((packed)) OutputHIDReport;

    void Communication_ProcessInputReportRequest(InputHIDReport* report);
    void Communication_ProcessOutputReport(const OutputHIDReport* reportid);
#endif