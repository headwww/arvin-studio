import staticStrUndefined from './staticStrUndefined';

const staticWindow: 0 | Window =
  // oxlint-disable-next-line valid-typeof
  typeof window === staticStrUndefined ? 0 : window;

export default staticWindow;
