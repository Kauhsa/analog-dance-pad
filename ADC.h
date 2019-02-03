#ifndef _ADC_H_
#define _ADC_H_
    #include <stdint.h>
    
    void ADC_Init(void);
    uint16_t ADC_Read(uint8_t channel);
#endif
