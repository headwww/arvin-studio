import type { IconDefinition } from '@arvin-studio/icons-svg/es/types';
import type { AbstractNode } from '@arvin-studio/icons-svg/lib/types';
import { defineComponent, shallowRef } from 'vue';
import {
  generate,
  getSecondaryColor,
  isIconDefinition,
  useInsertStyles,
} from '../utils.ts';

export interface IconProps {
  icon: IconDefinition;
  onClick?: ((e: MouseEvent) => void) | Array<(e: MouseEvent) => void>;
  primaryColor?: string; // only for two-tone
  secondaryColor?: string; // only for two-tone
  focusable?: string;
}

export interface TwoToneColorPaletteSetter {
  primaryColor: string;
  secondaryColor?: string;
}

export interface TwoToneColorPalette extends TwoToneColorPaletteSetter {
  calculated?: boolean; // marker for calculation
}

const twoToneColorPalette: TwoToneColorPalette = {
  primaryColor: '#333',
  secondaryColor: '#E6E6E6',
  calculated: false,
};

function setTwoToneColors({
  primaryColor,
  secondaryColor,
}: TwoToneColorPaletteSetter) {
  twoToneColorPalette.primaryColor = primaryColor;
  twoToneColorPalette.secondaryColor =
    secondaryColor || getSecondaryColor(primaryColor);
  twoToneColorPalette.calculated = !!secondaryColor;
}

function getTwoToneColors(): TwoToneColorPalette {
  return {
    ...twoToneColorPalette,
  };
}

interface IconBaseComponent {
  getTwoToneColors: typeof getTwoToneColors;
  setTwoToneColors: typeof setTwoToneColors;
}

type MaybeInteropIcon =
  | IconDefinition
  | { default?: IconDefinition }
  | undefined
  | null;

export function unwrapIconDefinition(
  icon: MaybeInteropIcon,
): IconDefinition | undefined {
  if (isIconDefinition(icon)) {
    return icon;
  }

  const maybeDefault =
    icon && typeof icon === 'object' && 'default' in icon
      ? (icon.default as unknown)
      : undefined;

  if (isIconDefinition(maybeDefault)) {
    return maybeDefault;
  }

  return undefined;
}

const IconBase = defineComponent<IconProps>(
  (props, { attrs }) => {
    const svgRef = shallowRef<HTMLElement>();
    useInsertStyles(svgRef);
    return () => {
      const { icon, onClick, primaryColor, secondaryColor } = props;
      const resolvedIcon = unwrapIconDefinition(icon as MaybeInteropIcon);
      let colors: TwoToneColorPalette = twoToneColorPalette;
      if (primaryColor) {
        colors = {
          primaryColor,
          secondaryColor: secondaryColor || getSecondaryColor(primaryColor),
        };
      }

      if (!resolvedIcon) {
        return null;
      }
      let target = resolvedIcon;
      if (target && typeof target.icon === 'function') {
        target = {
          ...target,
          icon: target.icon(colors.primaryColor, colors.secondaryColor!),
        };
      }
      return generate(target.icon as AbstractNode, `svg-${target.name}`, {
        onClick: (e: MouseEvent) => {
          if (Array.isArray(onClick)) {
            onClick.forEach((fn) => fn?.(e));
          } else {
            onClick?.(e);
          }
        },
        'data-icon': target.name,
        width: '1em',
        height: '1em',
        fill: 'currentColor',
        'aria-hidden': 'true',
        ref: svgRef,
        ...attrs,
      } as any);
    };
  },
  {
    name: 'IconBase',
    inheritAttrs: false,
  },
);
const IconBaseComp = IconBase as unknown as typeof IconBase & IconBaseComponent;

IconBaseComp.getTwoToneColors = getTwoToneColors;
IconBaseComp.setTwoToneColors = setTwoToneColors;

export default IconBaseComp;
