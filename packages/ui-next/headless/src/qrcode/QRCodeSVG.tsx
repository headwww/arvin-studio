import type { VNode } from 'vue';

import type { QRPropsSVG } from './interface';

import { computed, defineComponent, shallowRef, watchEffect } from 'vue';

import { useQRCode } from './hooks/useQRCode';
import { defaults } from './interface';
import {
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_FRONT_COLOR,
  DEFAULT_LEVEL,
  DEFAULT_MINVERSION,
  DEFAULT_NEED_MARGIN,
  DEFAULT_SIZE,
  excavateModules,
  generatePath,
} from './utils';

export const QRCodeSVG = defineComponent<QRPropsSVG>({
  name: 'QRCodeSVG',
  inheritAttrs: false,
  setup(props = defaults) {
    const image = shallowRef<null | VNode>(null);
    const fgPath = shallowRef('');
    const numCells = shallowRef(0);

    const qrcode = useQRCode(
      computed(() => {
        const {
          value,
          level = DEFAULT_LEVEL,
          includeMargin = DEFAULT_NEED_MARGIN,
          minVersion = DEFAULT_MINVERSION,
          marginSize,
          imageSettings,
          size = DEFAULT_SIZE,
          boostLevel,
        } = props;
        return {
          value,
          level,
          minVersion,
          includeMargin,
          marginSize,
          imageSettings,
          size,
          boostLevel,
        };
      }),
    );

    watchEffect(() => {
      const { imageSettings } = props;

      const {
        margin,
        cells,
        numCells: getNumCells,
        calculatedImageSettings,
      } = qrcode.value;

      let cellsToDraw = cells;
      numCells.value = getNumCells;

      if (imageSettings !== null && calculatedImageSettings !== null) {
        if (calculatedImageSettings.excavation !== null) {
          cellsToDraw = excavateModules(
            cells,
            calculatedImageSettings.excavation,
          );
        }

        image.value = (
          <image
            // when crossOrigin is not set, the image will be tainted
            // and the canvas cannot be exported to an image
            crossOrigin={calculatedImageSettings?.crossOrigin}
            height={calculatedImageSettings.h}
            href={imageSettings!.src}
            opacity={calculatedImageSettings.opacity}
            preserveAspectRatio="none"
            width={calculatedImageSettings.w}
            x={calculatedImageSettings.x + margin}
            y={calculatedImageSettings.y + margin}
          />
        );
      }

      fgPath.value = generatePath(cellsToDraw, margin);
    });

    return () => {
      const {
        bgColor = DEFAULT_BACKGROUND_COLOR,
        fgColor = DEFAULT_FRONT_COLOR,
        size,
        title,
      } = props;
      return (
        <svg
          height={size}
          role="img"
          viewBox={`0 0 ${numCells.value} ${numCells.value}`}
          width={size}
        >
          {!!title && <title>{title}</title>}
          <path
            d={`M0,0 h${numCells.value}v${numCells.value}H0z`}
            fill={bgColor}
            shape-rendering="crispEdges"
          />
          <path d={fgPath.value} fill={fgColor} shape-rendering="crispEdges" />
          {image.value}
        </svg>
      );
    };
  },
});
