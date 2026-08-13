import { TransformFactory } from '../..';
import { assignAttrsAtTag as assignAttributesAtTag } from '../creator';

export const setDefaultColorAtPathTag: (
  defaultColor: string,
) => TransformFactory = (defaultColor) =>
  assignAttributesAtTag('path', ({ previousAttrs }) => ({
    fill: previousAttrs.fill || defaultColor,
  }));
