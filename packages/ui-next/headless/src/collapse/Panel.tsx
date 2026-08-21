import type { HTMLAttributes, TransitionProps } from 'vue';

import type { CollapsePanelProps } from './interface';

import { computed, defineComponent, ref, Transition } from 'vue';

import { clsx, omit } from '@arvin-studio/kit';

import KeyCode from '../util/KeyCode';
import PanelContent from './PanelContent';

const defaults = {
  showArrow: true,
  classNames: {},
  styles: {},
} as any;

const CollapsePanel = defineComponent<CollapsePanelProps>({
  name: 'CollapsePanel',
  inheritAttrs: false,
  setup(props = defaults, { attrs, expose }) {
    const disabled = computed(() => props.collapsible === 'disabled');
    const refWrapper = ref();
    const ifExtraExist = computed(
      () =>
        props.extra !== null &&
        props.extra !== undefined &&
        typeof props.extra !== 'boolean',
    );

    const collapsibleProps = computed(() => {
      return {
        onClick: () => {
          props.onItemClick?.(props.panelKey!);
        },
        onKeydown: (e: KeyboardEvent) => {
          if (
            e.key === 'Enter' ||
            // eslint-disable-next-line unicorn/prefer-keyboard-event-key
            e.keyCode === KeyCode.ENTER ||
            // eslint-disable-next-line unicorn/prefer-keyboard-event-key
            e.which === KeyCode.ENTER
          ) {
            props.onItemClick?.(props.panelKey!);
          }
        },
        role: props.accordion ? 'tab' : 'button',
        'aria-expanded': props.isActive,
        'aria-disabled': disabled.value,
        tabIndex: disabled.value ? -1 : 0,
      };
    });

    expose({
      ref: refWrapper,
    });

    return () => {
      const {
        extra,
        prefixCls,
        isActive,
        class: className,
        expandIcon,
        forceRender,
        headerClass,
        collapsible,
        accordion,
        openMotion = {},
        // oxlint-disable-next-line no-unused-vars
        onItemClick,
        classNames: customizeClassNames = {},
        showArrow = true,
        destroyOnHidden,
        styles = {},
        header,
        // oxlint-disable-next-line no-unused-vars
        panelKey,
        children,
        ...restProps
      } = props;

      const collapsePanelClassNames = clsx(
        `${prefixCls}-item`,
        {
          [`${prefixCls}-item-active`]: isActive,
          [`${prefixCls}-item-disabled`]: disabled.value,
        },
        className,
      );
      const headerClassName = clsx(
        headerClass,
        `${prefixCls}-header`,
        {
          [`${prefixCls}-collapsible-${collapsible}`]: !!collapsible,
        },
        customizeClassNames.header,
      );

      const headerProps: HTMLAttributes = {
        class: headerClassName,
        style: styles.header,
        ...(!['header', 'icon'].includes(collapsible!) &&
          collapsibleProps.value),
      };

      // ======================== Icon ========================
      const iconNodeInner =
        typeof expandIcon === 'function' ? (
          expandIcon(props)
        ) : (
          <i class="arrow" />
        );
      const iconNode = iconNodeInner && (
        <div
          class={clsx(`${prefixCls}-expand-icon`, customizeClassNames?.icon)}
          style={styles?.icon}
          {...(['header', 'icon'].includes(collapsible!)
            ? collapsibleProps.value
            : {})}
        >
          {iconNodeInner}
        </div>
      );

      const panelContent = (
        <PanelContent
          classNames={customizeClassNames}
          forceRender={forceRender}
          isActive={isActive}
          prefixCls={prefixCls}
          role={accordion ? 'tabpanel' : undefined}
          styles={styles}
          v-show={isActive}
          v-slots={{ default: () => children }}
        />
      );

      const transitionProps: TransitionProps = {
        appear: false,
        // leaveToClass: `${prefixCls}-panel-hidden`,
        ...openMotion,
      };

      const mergedRestProps = {
        ...restProps,
        ...omit(attrs, ['class']),
      };

      return (
        <div
          {...(mergedRestProps as any)}
          class={collapsePanelClassNames}
          ref={refWrapper}
        >
          <div {...headerProps}>
            {showArrow && iconNode}
            <span
              class={clsx(`${prefixCls}-title`, customizeClassNames?.title)}
              style={styles?.title}
              {...(collapsible === 'header' ? collapsibleProps.value : {})}
            >
              {header}
            </span>
            {ifExtraExist.value && (
              <div class={`${prefixCls}-extra`}>{extra}</div>
            )}
          </div>

          <Transition {...transitionProps}>
            {!destroyOnHidden || isActive ? panelContent : null}
          </Transition>
        </div>
      );
    };
  },
});

export default CollapsePanel;
