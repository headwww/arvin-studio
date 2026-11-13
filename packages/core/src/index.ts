import { createEvent, GLOBAL_EVENT_KEYS, globalEvents } from './event';
import { formats } from './formats';
import { renderer } from './renderer';
import { globalResize } from './resize';

export const ArvinStudio = {
  renderer,
  formats,
  globalResize,
  globalEvents,
  GLOBAL_EVENT_KEYS,
  createEvent,
};

export default ArvinStudio;
export * from './formats';
export * from './renderer';
