import keys from './keys';
import includes from './includes';
import arrayEach from './arrayEach';
import assign from './assign';

/**
 * 将一个或者多个对象值解构到目标对象
 */
function destructuring<T>(obj: T, ...target: any[]): T;
function destructuring(destination: any, ...sources: any[]): any {
  if (destination && sources.length) {
    const rest = assign({}, ...sources);
    const restKeys = keys(rest);

    arrayEach(keys(destination), function (key: string) {
      if (includes(restKeys, key)) {
        destination[key] = rest[key];
      }
    });
  }

  return destination;
}
export default destructuring;
