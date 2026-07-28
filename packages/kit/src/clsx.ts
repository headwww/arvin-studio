type ClassDictionary = Record<string, any>;
type ClassArray = ClassValue[];
type ClassValue =
  | bigint
  | boolean
  | ClassArray
  | ClassDictionary
  | null
  | number
  | string
  | undefined;

function toVal(mix: ClassValue): string {
  let str = '';

  if (typeof mix === 'string' || typeof mix === 'number') {
    str += mix;
  } else if (typeof mix === 'object' && mix !== null) {
    if (Array.isArray(mix)) {
      for (const element of mix) {
        if (!element) {
          continue;
        }

        const y = toVal(element);
        if (y) {
          str && (str += ' ');
          str += y;
        }
      }
    } else {
      for (const y in mix as ClassDictionary) {
        if (!(mix as ClassDictionary)[y]) {
          continue;
        }

        str && (str += ' ');
        str += y;
      }
    }
  }

  return str;
}

function clsx(...inputs: ClassValue[]): string {
  let str = '';
  for (const tmp of inputs) {
    if (!tmp) {
      continue;
    }

    const x = toVal(tmp);
    if (x) {
      str && (str += ' ');
      str += x;
    }
  }
  return str;
}

export type { ClassArray, ClassDictionary, ClassValue };
export default clsx;
