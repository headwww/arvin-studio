import { createEvent, GLOBAL_EVENT_KEYS, globalEvents } from './event';
import { formats } from './formats';
import { hooks } from './hooks';
import { interceptor } from './interceptor';
import { renderer } from './renderer';
import { globalResize } from './resize';

export const ArvinStudio = {
  renderer,
  formats,
  globalResize,
  globalEvents,
  hooks,
  interceptor,
  GLOBAL_EVENT_KEYS,
  createEvent,
};

export default ArvinStudio;
export * from './event';
export * from './formats';
export * from './formats';
export * from './hooks';
export * from './interceptor';
export * from './renderer';
export * from './resize';
