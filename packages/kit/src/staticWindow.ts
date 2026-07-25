import staticStrUndefined from './staticStrUndefined';

const staticWindow: Window | 0 =
  // oxlint-disable-next-line valid-typeof
  typeof window === staticStrUndefined ? 0 : window;

export default staticWindow;
