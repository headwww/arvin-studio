import type { CSSProperties } from 'vue';

import type { EmptyEmit } from '../../_util';
import type { AggregationColor } from '../color';
import type {
  ColorFormatType,
  ColorPickerProps,
  ColorPickerSemanticClassNames,
  ColorPickerSemanticStyles,
} from '../interface';

import { computed, defineComponent } from 'vue';

import { ColorBlock } from '@arvin-studio/headless';
import { clsx } from '@arvin-studio/kit';

import useLocale from '../../locale/useLocale';
import { getColorAlpha } from '../util';
import ColorClear from './ColorClear';

export interface ColorTriggerProps {
  activeIndex: number;
  classes: ColorPickerSemanticClassNames;
  className?: string;
  color: AggregationColor;
  disabled?: boolean;
  format?: ColorFormatType;
  open?: boolean;
  prefixCls: string;
  showText?: ColorPickerProps['showText'];
  style?: CSSProperties;
  styles: ColorPickerSemanticStyles;
}

export default defineComponent<ColorTriggerProps, EmptyEmit, string>(
  (props, { attrs }) => {
    const [locale] = useLocale('ColorPicker');
    const colorTriggerPrefixCls = computed(() => `${props.prefixCls}-trigger`);
    const colorTextPrefixCls = computed(
      () => `${colorTriggerPrefixCls.value}-text`,
    );
    const colorTextCellPrefixCls = computed(
      () => `${colorTextPrefixCls.value}-cell`,
    );

    const desc = computed(() => {
      const { color, showText, format, activeIndex } = props;
      if (!showText) return '';
      if (typeof showText === 'function') return showText({ color });
      if (color.cleared) return locale?.value?.transparent;
      if (color.isGradient()) {
        return color.getColors().map((c, index) => {
          const inactive = activeIndex !== -1 && activeIndex !== index;
          return (
            <span
              class={clsx(
                colorTextCellPrefixCls.value,
                inactive && `${colorTextCellPrefixCls.value}-inactive`,
              )}
              key={index}
            >
              {`${c.color.toRgbString()} ${c.percent}%`}
            </span>
          );
        });
      }
      const hexString = color.toHexString().toUpperCase();
      const alpha = getColorAlpha(color);
      switch (format) {
        case 'hsb': {
          return color.toHsbString();
        }
        case 'rgb': {
          return color.toRgbString();
        }
        default: {
          return alpha < 100 ? `${hexString.slice(0, 7)},${alpha}%` : hexString;
        }
      }
    });

    const containerNode = computed(() => {
      const { color, prefixCls, classes, styles } = props;
      return color?.cleared ? (
        <ColorClear
          class={classes.body}
          prefixCls={prefixCls}
          style={styles.body}
        />
      ) : (
        <ColorBlock
          class={classes.body}
          color={color.toCssString()}
          innerClassName={classes.content}
          innerStyle={styles.content}
          prefixCls={prefixCls}
          style={styles.body}
        />
      );
    });

    return () => {
      const { open, disabled, style, className, classes, styles } = props;
      return (
        <div
          {...attrs}
          class={clsx(colorTriggerPrefixCls.value, className, classes.root, {
            [`${colorTriggerPrefixCls.value}-active`]: open,
            [`${colorTriggerPrefixCls.value}-disabled`]: disabled,
          })}
          style={[styles.root, style]}
        >
          {containerNode.value}
          {props.showText && (
            <div
              class={[colorTextPrefixCls.value, classes.description]}
              style={classes.description}
            >
              {desc.value}
            </div>
          )}
        </div>
      );
    };
  },
  {
    name: 'AsColorTrigger',
    inheritAttrs: false,
  },
);
