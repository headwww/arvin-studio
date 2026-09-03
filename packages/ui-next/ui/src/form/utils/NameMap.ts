import type { InternalNamePath } from '../types';

interface KV<T> {
  key: InternalNamePath;
  value: T;
}

const SPLIT = '__@field_split__';

/**
 * Convert name path into string to fast the fetch speed of Map.
 */
function normalize(namePath: InternalNamePath): string {
  return (
    namePath
      .map((cell) => `${typeof cell}:${cell}`)
      // Magic split
      .join(SPLIT)
  );
}

/**
 * NameMap like a `Map` but accepts `string[]` as key.
 */
class NameMap<T> {
  private kvs = new Map<string, T>();

  public delete(key: InternalNamePath) {
    this.kvs.delete(normalize(key));
  }

  public get(key: InternalNamePath) {
    return this.kvs.get(normalize(key));
  }

  // Since we only use this in test, let simply realize this
  public map<U>(callback: (kv: KV<T>) => U) {
    // eslint-disable-next-line unicorn/prefer-iterator-to-array
    return [...this.kvs.entries()].map(([key, value]) => {
      const cells = key.split(SPLIT);

      return callback({
        key: cells.map((cell) => {
          // @ts-expect-error THIS
          const [, type, unit] = cell.match(/^([^:]*):(.*)$/);
          return type === 'number' ? Number(unit) : unit;
        }),
        value,
      });
    });
  }

  public set(key: InternalNamePath, value: T) {
    this.kvs.set(normalize(key), value);
  }

  public toJSON(): Record<string, T> {
    const json: Record<string, T> = {};
    this.map(({ key, value }) => {
      json[key.join('.')] = value;
      return null;
    });

    return json;
  }

  public update(key: InternalNamePath, updater: (origin: T) => null | T) {
    const origin = this.get(key);
    const next = updater(origin!);

    if (next) {
      this.set(key, next);
    } else {
      this.delete(key);
    }
  }
}

export default NameMap;
