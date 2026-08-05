import hash from '@emotion/hash';

const resolveHash = (src: string) =>
  (hash as any).default && typeof (hash as any).default === 'function'
    ? (hash as any).default(src)
    : hash(src);
export default resolveHash;
