import { EventEmitter } from 'events'
import StrictEventEmitter from 'strict-event-emitter-types/types/src'

export const ExtendableEmitter = <T>() =>
  EventEmitter as {
    new (): StrictEventEmitter<EventEmitter, T>
  }
