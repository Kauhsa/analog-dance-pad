#ifndef _CONFIGSTORE_H_
#define _CONFIGSTORE_H_
    #include "Pad.h"

    void ConfigStore_LoadConfiguration(PadConfiguration* conf);
    void ConfigStore_StoreConfiguration(const PadConfiguration* conf);
#endif
