import type {
  PopoverClassNamesType,
  PopoverProps,
  PopoverSemanticClassNames,
  PopoverSemanticStyles,
  PopoverStylesType,
} from '.';
import type { VueNode } from '../_util';

import { computed, defineComponent } from 'vue';

import { filterEmpty, Popup } from '@arvin-studio/headless';
import { clsx, omit } from '@arvin-studio/kit';

import { useMergeSemantic, useToArr, useToProps } from '../_util/hooks';
import { isRenderable } from '../_util/is';
import { getSlotPropsFnRun, toPropsRefs } from '../_util/tools';
import { useComponentBaseConfig } from '../config-provider/context';
import useStyle from './style';

interface OverlayProps {
  classes?: PopoverSemanticClassNames;
  content?: VueNode;
  prefixCls?: string;
  styles?: PopoverSemanticStyles;
  title?: VueNode;
}

export const Overlay = defineComponent<OverlayProps>((props, { slots }) => {
  return () => {
    const { prefixCls, classes, styles } = props;
    const title = getSlotPropsFnRun(slots, props, 'title');
    const content = getSlotPropsFnRun(slots, props, 'content');
    if (!isRenderable(title) && !isRenderable(content)) {
      return null;
    }
    return (
      <>
        {isRenderable(title) && (
          <div
            class={clsx(`${prefixCls}-title`, classes?.title)}
            style={styles?.title}
          >
            {title}
          </div>
        )}
        {isRenderable(content) && (
          <div
            class={clsx(`${prefixCls}-content`, classes?.content)}
            style={styles?.content}
          >
            {content}
          </div>
        )}
      </>
    );
  };
});

export interface PurePanelProps extends PopoverProps {}

interface RawPurePanelProps extends PopoverProps {
  hashId: string;
}
const defaults = {
  placement: 'top',
} as any;

export const RawPurePanel = defineComponent<RawPurePanelProps>(
  (props = defaults, { slots, attrs }) => {
    const { classes, styles } = toPropsRefs(props, 'styles', 'classes');
    const mergedProps = computed(() => {
      return props;
    });

    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      PopoverClassNamesType,
      PopoverStylesType,
      PopoverProps
    >(useToArr(classes), useToArr(styles), useToProps(mergedProps));
    return () => {
      const titleNode = getSlotPropsFnRun(slots, props, 'title');
      const contentNode = getSlotPropsFnRun(slots, props, 'content');
      const children = filterEmpty(slots?.default?.() ?? []);
      const { hashId, prefixCls, placement } = props;
      const rootClassName = clsx(
        hashId,
        prefixCls,
        `${prefixCls}-pure`,
        `${prefixCls}-placement-${placement}`,
        (attrs as any).class,
      );
      return (
        <div class={rootClassName} style={(attrs as any).style}>
          <div class={`${prefixCls}-arrow`} />
          <Popup
            {...props}
            className={hashId}
            classNames={mergedClassNames.value}
            prefixCls={prefixCls}
            styles={mergedStyles.value}
          >
            {children.length > 0 ? (
              children
            ) : (
              <Overlay
                classes={mergedClassNames.value}
                content={contentNode}
                prefixCls={prefixCls}
                styles={mergedStyles.value}
                title={titleNode}
              />
            )}
          </Popup>
        </div>
      );
    };
  },
  {
    name: 'PopoverRawPurePanel',
    inheritAttrs: false,
  },
);

const PurePanel = defineComponent<PurePanelProps>(
  (props, { attrs, slots }) => {
    const { prefixCls } = useComponentBaseConfig('popover', props);
    const [hashId, cssVarCls] = useStyle(prefixCls);

    return () => {
      const content = getSlotPropsFnRun(slots, props, 'content');
      return (
        <RawPurePanel
          {...omit(attrs, ['class'])}
          {...props}
          class={clsx((attrs as any).class, cssVarCls.value)}
          content={content}
          hashId={hashId.value}
          prefixCls={prefixCls.value}
        />
      );
    };
  },
  {
    name: 'PopoverPurePanel',
    inheritAttrs: false,
  },
);

export default PurePanel;
