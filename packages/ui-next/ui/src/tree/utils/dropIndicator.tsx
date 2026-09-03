import type { CSSProperties } from 'vue';

import type { DirectionType } from '../../config-provider/context';

export const offset = 4;

function dropIndicatorRender(props: {
  direction: DirectionType;
  dropLevelOffset: number;
  dropPosition: -1 | 0 | 1;
  indent: number;
  prefixCls: string;
}) {
  const {
    dropPosition,
    dropLevelOffset,
    prefixCls,
    indent,
    direction = 'ltr',
  } = props;
  const startPosition = direction === 'ltr' ? 'left' : 'right';
  const endPosition = direction === 'ltr' ? 'right' : 'left';
  const style: CSSProperties = {
    [startPosition]: `${-dropLevelOffset * indent + offset}px`,
    [endPosition]: 0,
  };
  switch (dropPosition) {
    case -1: {
      style.top = `-3px`;
      break;
    }
    case 1: {
      style.bottom = `-3px`;
      break;
    }
    default: {
      // dropPosition === 0
      style.bottom = `-3px`;
      style[startPosition] = `${indent + offset}px`;
      break;
    }
  }
  return <div class={`${prefixCls}-drop-indicator`} style={style} />;
}

export default dropIndicatorRender;
