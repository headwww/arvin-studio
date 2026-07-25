import staticStrUndefined from './staticStrUndefined';

const staticDocument: Document | 0 =
  // oxlint-disable-next-line valid-typeof
  typeof document === staticStrUndefined ? 0 : document;

export default staticDocument;
