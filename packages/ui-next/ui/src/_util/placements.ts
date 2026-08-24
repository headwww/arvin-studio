import type { AlignType, BuildInPlacements } from '@arvin-studio/headless';

import { getArrowOffsetToken } from '../style/placementArrow';

export interface AdjustOverflow {
  adjustX?: 0 | 1;
  adjustY?: 0 | 1;
}

export interface PlacementsConfig {
  arrowPointAtCenter?: boolean;
  arrowWidth: number;
  autoAdjustOverflow?: AdjustOverflow | boolean;
  borderRadius: number;
  offset: number;
  visibleFirst?: boolean;
}

export function getOverflowOptions(
  placement: string,
  arrowOffset: ReturnType<typeof getArrowOffsetToken>,
  arrowWidth: number,
  autoAdjustOverflow?: AdjustOverflow | boolean,
) {
  if (autoAdjustOverflow === false) {
    return {
      adjustX: false,
      adjustY: false,
    };
  }

  const overflow =
    autoAdjustOverflow && typeof autoAdjustOverflow === 'object'
      ? autoAdjustOverflow
      : {};

  const baseOverflow: AlignType['overflow'] = {};

  switch (placement) {
    case 'bottom':
    case 'top': {
      baseOverflow.shiftX = arrowOffset.arrowOffsetHorizontal * 2 + arrowWidth;
      baseOverflow.shiftY = true;
      baseOverflow.adjustY = true;
      break;
    }

    case 'left':
    case 'right': {
      baseOverflow.shiftY = arrowOffset.arrowOffsetVertical * 2 + arrowWidth;
      baseOverflow.shiftX = true;
      baseOverflow.adjustX = true;
      break;
    }
  }

  const mergedOverflow = {
    ...baseOverflow,
    ...overflow,
  };

  // Support auto shift
  if (!mergedOverflow.shiftX) {
    mergedOverflow.adjustX = true;
  }
  if (!mergedOverflow.shiftY) {
    mergedOverflow.adjustY = true;
  }

  return mergedOverflow;
}

type PlacementType = keyof BuildInPlacements;

const PlacementAlignMap: BuildInPlacements = {
  left: {
    points: ['cr', 'cl'],
  },
  right: {
    points: ['cl', 'cr'],
  },
  top: {
    points: ['bc', 'tc'],
  },
  bottom: {
    points: ['tc', 'bc'],
  },
  topLeft: {
    points: ['bl', 'tl'],
  },
  leftTop: {
    points: ['tr', 'tl'],
  },
  topRight: {
    points: ['br', 'tr'],
  },
  rightTop: {
    points: ['tl', 'tr'],
  },
  bottomRight: {
    points: ['tr', 'br'],
  },
  rightBottom: {
    points: ['bl', 'br'],
  },
  bottomLeft: {
    points: ['tl', 'bl'],
  },
  leftBottom: {
    points: ['br', 'bl'],
  },
};

const ArrowCenterPlacementAlignMap: BuildInPlacements = {
  topLeft: {
    points: ['bl', 'tc'],
  },
  leftTop: {
    points: ['tr', 'cl'],
  },
  topRight: {
    points: ['br', 'tc'],
  },
  rightTop: {
    points: ['tl', 'cr'],
  },
  bottomRight: {
    points: ['tr', 'bc'],
  },
  rightBottom: {
    points: ['bl', 'cr'],
  },
  bottomLeft: {
    points: ['tl', 'bc'],
  },
  leftBottom: {
    points: ['br', 'cl'],
  },
};

const DisableAutoArrowList: Set<keyof BuildInPlacements> = new Set([
  'bottomLeft',
  'bottomRight',
  'leftBottom',
  'leftTop',
  'rightBottom',
  'rightTop',
  'topLeft',
  'topRight',
]);

export default function getPlacements(config: PlacementsConfig) {
  const {
    arrowWidth,
    autoAdjustOverflow,
    arrowPointAtCenter,
    offset,
    borderRadius,
    visibleFirst,
  } = config;
  const halfArrowWidth = arrowWidth / 2;

  const placementMap: BuildInPlacements = {};

  // Dynamic offset
  const arrowOffset = getArrowOffsetToken({
    contentRadius: borderRadius,
    limitVerticalRadius: true,
  });

  Object.keys(PlacementAlignMap).forEach((key: PlacementType) => {
    const template =
      (arrowPointAtCenter && ArrowCenterPlacementAlignMap[key]) ||
      PlacementAlignMap[key];

    const placementInfo = {
      ...template,
      offset: [0, 0],
      dynamicInset: true,
    };
    placementMap[key] = placementInfo;

    // Disable autoArrow since design is fixed position
    if (DisableAutoArrowList.has(key)) {
      placementInfo.autoArrow = false;
    }

    // Static offset
    switch (key) {
      case 'bottom':
      case 'bottomLeft':
      case 'bottomRight': {
        placementInfo.offset[1] = halfArrowWidth + offset;
        break;
      }

      case 'left':
      case 'leftBottom':
      case 'leftTop': {
        placementInfo.offset[0] = -halfArrowWidth - offset;
        break;
      }

      case 'right':
      case 'rightBottom':
      case 'rightTop': {
        placementInfo.offset[0] = halfArrowWidth + offset;
        break;
      }

      case 'top':
      case 'topLeft':
      case 'topRight': {
        placementInfo.offset[1] = -halfArrowWidth - offset;
        break;
      }
    }

    if (arrowPointAtCenter) {
      switch (key) {
        case 'bottomLeft':
        case 'topLeft': {
          placementInfo.offset[0] =
            -arrowOffset.arrowOffsetHorizontal - halfArrowWidth;
          break;
        }

        case 'bottomRight':
        case 'topRight': {
          placementInfo.offset[0] =
            arrowOffset.arrowOffsetHorizontal + halfArrowWidth;
          break;
        }

        case 'leftBottom':
        case 'rightBottom': {
          placementInfo.offset[1] =
            arrowOffset.arrowOffsetHorizontal * 2 - halfArrowWidth;
          break;
        }

        case 'leftTop':
        case 'rightTop': {
          placementInfo.offset[1] =
            -arrowOffset.arrowOffsetHorizontal * 2 + halfArrowWidth;
          break;
        }
      }
    }

    // Overflow
    placementInfo.overflow = getOverflowOptions(
      key,
      arrowOffset,
      arrowWidth,
      autoAdjustOverflow,
    );

    // VisibleFirst
    if (visibleFirst) {
      placementInfo.htmlRegion = 'visibleFirst';
    }
  });

  return placementMap;
}
