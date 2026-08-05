import { unit } from '../../util';

function genMaxMin(type: 'css' | 'js') {
  if (type === 'js') {
    return {
      max: Math.max,
      min: Math.min,
    };
  }

  return {
    max: (...args: (number | string)[]) =>
      `max(${args.map((value) => unit(value)).join(',')})`,
    min: (...args: (number | string)[]) =>
      `min(${args.map((value) => unit(value)).join(',')})`,
  };
}

export default genMaxMin;
