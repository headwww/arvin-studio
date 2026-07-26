import staticStrUndefined from './staticStrUndefined';

const staticLocation: 0 | Location =
  // oxlint-disable-next-line valid-typeof
  typeof location === staticStrUndefined ? 0 : location;

export default staticLocation;
