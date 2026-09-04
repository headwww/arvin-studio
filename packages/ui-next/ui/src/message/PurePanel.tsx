import type { NotificationProps } from '@arvin-studio/headless';

import type { VueNode } from '../_util';
import type {
  ArgsClassNamesType,
  ArgsStylesType,
  MessageSemanticClassNames,
  MessageSemanticStyles,
  NoticeType,
} from './interface';

import { computed, defineComponent } from 'vue';

import { Notification } from '@arvin-studio/headless';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
  InfoCircleFilled,
  LoadingOutlined,
} from '@arvin-studio/icons';
import { clsx, omit } from '@arvin-studio/kit';

import {
  pureAttrs,
  useMergeSemantic,
  useToArr,
  useToProps,
} from '../_util/hooks';
import { toPropsRefs } from '../_util/tools';
import { useComponentBaseConfig } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useStyle from './style';

export interface PureContentProps {
  classNames?: MessageSemanticClassNames;
  icon?: VueNode;
  prefixCls: string;
  styles?: MessageSemanticStyles;
  type?: NoticeType;
}

export const TypeIcon: Record<NoticeType, any> = {
  info: InfoCircleFilled,
  success: CheckCircleFilled,
  error: CloseCircleFilled,
  warning: ExclamationCircleFilled,
  loading: LoadingOutlined,
};

/**
 * Returns a renderable icon vnode for
 * the type, allowing a custom `icon` to take precedence. The notice element
 * wraps it with `${prefixCls}-notice-icon`, so the returned vnode does NOT
 * need the `${prefixCls}-icon` class anymore.
 */
export function resolveMessageIcon(
  _prefixCls: string,
  icon: undefined | VueNode,
  type: NoticeType | undefined,
): VueNode {
  if (icon !== undefined && icon !== null) {
    return icon as VueNode;
  }
  const IconNode = type ? TypeIcon[type] : null;
  return IconNode ? <IconNode /> : null;
}

export const PureContent = defineComponent<PureContentProps>(
  (props, { slots }) => {
    return () => {
      const { prefixCls, type, icon } = props;
      const iconNode = resolveMessageIcon(prefixCls, icon, type);
      return (
        <>
          {iconNode}
          {slots.default?.()}
        </>
      );
    };
  },
  {
    name: 'MessagePureContent',
    inheritAttrs: false,
  },
);

export interface PurePanelProps extends Omit<
  PureContentProps,
  'children' | 'classNames' | 'prefixCls' | 'styles'
> {
  class?: string;
  classes?: ArgsClassNamesType;
  closable?:
    | boolean
    | (Record<string, any> & { closeIcon?: VueNode; onClose?: VoidFunction });
  closeIcon?: VueNode;
  content?: VueNode;
  duration?: false | null | number;
  onClick?: (event: Event) => void;
  onClose?: VoidFunction;
  pauseOnHover?: boolean;
  prefixCls?: string;
  props?: Record<string, any>;
  showProgress?: boolean;
  styles?: ArgsStylesType;
}

const omitKeys: (keyof PurePanelProps)[] = [
  'prefixCls',
  'type',
  'icon',
  'content',
  'classes',
  'styles',
  'class',
];

/** @private Internal Component. Do not use in your production. */
const PurePanel = defineComponent<PurePanelProps>(
  (props, { attrs }) => {
    const { classes: messageClassNames, styles } = toPropsRefs(
      props,
      'classes',
      'styles',
    );
    const {
      getPrefixCls,
      class: contextClassName,
      style: contextStyle,
      classes: contextClassNames,
      styles: contextStyles,
    } = useComponentBaseConfig('message', props);
    const prefixCls = computed(
      () => props.prefixCls ?? getPrefixCls('message'),
    );
    const mergedProps = computed(() => props);
    const rootCls = useCSSVarCls(prefixCls);
    const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      ArgsClassNamesType,
      ArgsStylesType,
      PurePanelProps
    >(
      useToArr(contextClassNames, messageClassNames),
      useToArr(contextStyles, styles),
      useToProps(mergedProps),
    );

    return () => {
      const restProps = omit(props, omitKeys);
      const noticePrefixCls = `${prefixCls.value}-notice`;
      const iconNode = resolveMessageIcon(
        prefixCls.value,
        props.icon,
        props.type,
      );
      const typeIconCls = props.type
        ? `${noticePrefixCls}-icon-${props.type}`
        : undefined;

      return (
        <Notification
          {...pureAttrs(attrs)}
          {...(restProps as NotificationProps)}
          class={clsx(
            contextClassName.value,
            mergedClassNames.value?.root,
            props.class,
            hashId.value,
            cssVarCls.value,
            rootCls.value,
            `${prefixCls.value}-notice-pure-panel`,
            props.type && `${noticePrefixCls}-${props.type}`,
          )}
          classNames={{
            wrapper: clsx(
              props.type && `${prefixCls.value}-${props.type}`,
              mergedClassNames.value?.wrapper,
            ),
            icon: clsx(typeIconCls, mergedClassNames.value?.icon),
            title: mergedClassNames.value?.title,
          }}
          duration={null}
          icon={iconNode}
          prefixCls={prefixCls.value}
          style={{
            ...mergedStyles.value.root,
            ...contextStyle.value,
            ...(attrs as any).style,
          }}
          styles={{
            wrapper: mergedStyles.value?.wrapper,
            icon: mergedStyles.value?.icon,
            title: mergedStyles.value?.title,
          }}
          title={props.content}
        />
      );
    };
  },
  {
    name: 'MessagePurePanel',
    inheritAttrs: false,
  },
);

export default PurePanel;
