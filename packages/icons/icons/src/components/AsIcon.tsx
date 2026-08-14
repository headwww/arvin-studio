import type { IconDefinition } from '@arvin-studio/icons-svg/lib/types';
import type { IconBaseProps } from './Icon';

import type { TwoToneColor } from './twoTonePrimaryColor';
import { blue } from '@arvin-studio/headless';
import { clsx } from '@arvin-studio/kit';
import { defineComponent } from 'vue';
import { normalizeTwoToneColors } from '../utils.ts';
import { useIconContext } from './Context.tsx';
import IconBase from './IconBase';
import { getTwoToneColor, setTwoToneColor } from './twoTonePrimaryColor';

export interface AsIconProps extends IconBaseProps {
  twoToneColor?: TwoToneColor;
  onClick?: ((e: MouseEvent) => void) | Array<(e: MouseEvent) => void>;
  tabIndex?: number;
}

export interface IconComponentProps extends AsIconProps {
  icon: IconDefinition;
}

// Initial setting
// should move it to as main repo?
setTwoToneColor(blue.primary!);

// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/34757#issuecomment-488848720
interface IconBaseComponent {
  getTwoToneColor: typeof getTwoToneColor;
  setTwoToneColor: typeof setTwoToneColor;
}

const Icon = defineComponent<IconComponentProps>(
  (props, { attrs }) => {
    const iconContext = useIconContext();
    return () => {
      const {
        // affect inner <svg>...</svg>
        icon,
        spin,
        rotate,
        onClick,
        tabIndex,
        // other
        twoToneColor,

        ...restProps
      } = props;
      const { prefixCls = 'asicon', rootClass } = iconContext.value;
      const classString = clsx(rootClass, prefixCls, {
        [`${prefixCls}-${icon.name}`]: !!icon.name,
        [`${prefixCls}-spin`]: !!spin || icon.name === 'loading',
      });
      let iconTabIndex = tabIndex;
      if (iconTabIndex === undefined && onClick) {
        iconTabIndex = -1;
      }

      const svgStyle = rotate
        ? {
            msTransform: `rotate(${rotate}deg)`,
            transform: `rotate(${rotate}deg)`,
          }
        : undefined;

      const [primaryColor, secondaryColor] =
        normalizeTwoToneColors(twoToneColor);
      const restAttrs = { ...attrs };
      delete restAttrs.class;
      return (
        <span
          role="img"
          aria-label={icon.name}
          {...restProps}
          {...restAttrs}
          tabindex={iconTabIndex}
          onClick={(e) => {
            if (Array.isArray(onClick)) {
              onClick.forEach((fn) => fn?.(e));
            } else {
              onClick?.(e);
            }
          }}
          class={[classString, attrs.class]}
        >
          <IconBase
            icon={icon}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            style={svgStyle}
          />
        </span>
      );
    };
  },
  {
    inheritAttrs: false,
  },
);

const AsIcon = Icon as unknown as typeof Icon & IconBaseComponent;

AsIcon.getTwoToneColor = getTwoToneColor;
AsIcon.setTwoToneColor = setTwoToneColor;

export default AsIcon;
