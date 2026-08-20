function isNonNullable<T>(val: T): val is NonNullable<T> {
  return val !== undefined && val !== null;
}

export default isNonNullable;
