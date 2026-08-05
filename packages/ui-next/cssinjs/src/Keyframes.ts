import type { CSSInterpolation } from './hooks/useStyleRegister';

class Keyframe {
  style: CSSInterpolation;
  // eslint-disable-next-line unicorn/consistent-class-member-order
  private readonly name: string;

  constructor(name: string, style: CSSInterpolation) {
    this.name = name;
    this.style = style;
  }

  getName(hashId: string = ''): string {
    return hashId ? `${hashId}-${this.name}` : this.name;
  }

  // eslint-disable-next-line perfectionist/sort-classes, unicorn/prefer-private-class-fields
  _keyframe = true;
}

export default Keyframe;
