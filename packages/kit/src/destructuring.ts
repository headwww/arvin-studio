import arrayEach from './arrayEach';
import assign from './assign';
import includes from './includes';
import keys from './keys';

/**
 * 将一个或者多个对象值解构到目标对象
 */
function destructuring<T>(obj: T, ...target: any[]): T;
function destructuring(destination: any, ...sources: any[]): any {
  if (destination && sources.length > 0) {
    const rest = assign({}, ...sources);
    const restKeys = keys(rest);

    arrayEach(keys(destination), (key: string) => {
      if (includes(restKeys, key)) {
        destination[key] = rest[key];
      }
    });
  }

  return destination;
}
export default destructuring;
