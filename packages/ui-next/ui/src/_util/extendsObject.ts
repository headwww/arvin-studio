function mergeProps<A, B>(a: A, b: B): A & B;
function mergeProps<A, B, C>(a: A, b: B, c: C): A & B & C;
function mergeProps<A, B, C, D>(a: A, b: B, c: C, d: D): A & B & C & D;
function mergeProps(...items: any[]) {
  const ret: any = {};
  items.forEach((item) => {
    if (item) {
      Object.keys(item).forEach((key) => {
        if (item[key] !== undefined) {
          ret[key] = item[key];
        }
      });
    }
  });
  return ret;
}

export default mergeProps;
