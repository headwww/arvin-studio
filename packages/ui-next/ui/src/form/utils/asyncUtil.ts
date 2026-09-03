import type { FieldError } from '../types';

export function allPromiseFinish(
  promiseList: Promise<FieldError>[],
): Promise<FieldError[]> {
  let hasError = false;
  let count = promiseList.length;
  const results: FieldError[] = [];

  if (promiseList.length === 0) {
    return Promise.resolve([]);
  }

  return new Promise((resolve, reject) => {
    promiseList.forEach((promise, index) => {
      promise
        .catch((error) => {
          hasError = true;
          return error;
        })
        .then((result) => {
          count -= 1;
          results[index] = result;

          if (count > 0) {
            return;
          }

          if (hasError) {
            // oxlint-disable-next-line prefer-promise-reject-errors
            reject(results);
          }
          // eslint-disable-next-line unicorn/no-multiple-promise-resolver-calls
          resolve(results);
        });
    });
  });
}
