#include <stdint.h>
#include <avr/io.h>

#include "Config/DancePadConfig.h"

static const uint8_t sensorToAnalogPin[12] = {
    0, 1, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13
};

#if ADC_TEST_MODE
    static uint16_t test_mode_value = 0;
#endif

void ADC_Init(void) {
    // different prescalers change conversion speed. tinker! 111 is slowest, and not fast enough for many sensors.
    const uint8_t prescaler = (1 << ADPS2) | (1 << ADPS1) | (0 << ADPS0);

    ADCSRA = (1 << ADEN) | prescaler;
    ADMUX = (1 << REFS0); // analog reference = 5V VCC
    ADCSRB = (1 << ADHSM); // enable high speed mode
}

uint16_t ADC_Read(uint8_t sensor) {
    uint8_t pin = sensorToAnalogPin[sensor];

    // pin selection is, annoyingly, in 2 different registers
    ADMUX = (ADMUX & 0b11111000) | (pin & 0b00000111); // select channel (MUX0-4 bits, though we only need MUX2-4)
    ADCSRB = (ADCSRB & 0x11011111) | ((pin & 0x00001000) << 2); // select channel (MUX5 bit)

    ADCSRA |= (1 << ADSC); // start conversion
    while (ADCSRA & (1 << ADSC)) {}; // wait until done

    #if ADC_TEST_MODE
        test_mode_value++;
        return ((test_mode_value / 50) + (sensor * 50)) % 1024;
    #else
        return ADC;  
    #endif
}
