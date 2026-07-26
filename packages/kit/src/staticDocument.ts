import staticStrUndefined from './staticStrUndefined';

const staticDocument: 0 | Document =
  // oxlint-disable-next-line valid-typeof
  typeof document === staticStrUndefined ? 0 : document;

export default staticDocument;
