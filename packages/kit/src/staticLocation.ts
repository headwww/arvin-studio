import staticStrUndefined from './staticStrUndefined';

const staticLocation: Location | 0 =
  // oxlint-disable-next-line valid-typeof
  typeof location === staticStrUndefined ? 0 : location;

export default staticLocation;
