function copyWithin<T>(
  arr: T[],
  target: number,
  start?: number,
  end?: number,
): T[] {
  return arr.copyWithin(
    target,
    start || 0,
    end === undefined ? arr.length : end,
  );
}

export default copyWithin;
