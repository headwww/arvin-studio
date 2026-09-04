import type { VueNode } from '../_util';
import type { ComponentBaseProps } from '../config-provider/context';

import { computed, defineComponent, nextTick, watch } from 'vue';

import { clsx } from '@arvin-studio/kit';

import { getSlotPropsFnRun } from '../_util/tools';
import { useBaseConfig } from '../config-provider/context';
import { useAnchorContext } from './context';

export interface AnchorLinkBaseProps extends ComponentBaseProps {
  href: string;
  replace?: boolean;
  target?: string;
  targetOffset?: number;
  title: VueNode;
}

export interface AnchorLinkEmits {
  click: (e: MouseEvent, params: { href: any; title: any }) => any;
}

export interface AnchorLinkEmitsProps {
  onClick?: AnchorLinkEmits['click'];
}

export interface AnchorLinkProps
  extends
    AnchorLinkBaseProps,
    /* @vue-ignore */
    AnchorLinkEmitsProps {}

const AnchorLink = defineComponent<AnchorLinkProps, AnchorLinkEmits, string>(
  (props, { slots, attrs }) => {
    const {
      registerLink,
      direction,
      unregisterLink,
      activeLink,
      scrollTo,
      onClick,
      classes: mergedClassNames,
      styles: mergedStyles,
    } = useAnchorContext() ?? {};
    const { prefixCls } = useBaseConfig('anchor', props);
    watch(
      () => props.href,
      async (href, _, onCleanup) => {
        await nextTick();
        registerLink?.(href);
        onCleanup(() => {
          unregisterLink?.(href);
        });
      },
      {
        immediate: true,
      },
    );

    const handleClick = (e: MouseEvent) => {
      const { href, replace } = props;
      const title = getSlotPropsFnRun(slots, props, 'title');

      onClick?.(e, { title, href });
      scrollTo?.(href, props.targetOffset);
      // Support clicking on an anchor does not record history.
      if (e.defaultPrevented) {
        return;
      }
      const isExternalLink =
        href.startsWith('http://') || href.startsWith('https://');
      // Support external link
      if (isExternalLink && replace) {
        e.preventDefault();
        window.location.replace(href);
      }
      // Handling internal anchor link
      e.preventDefault();
      const historyMethod = replace ? 'replaceState' : 'pushState';
      window.history[historyMethod](null, '', href);
    };
    const active = computed(() => activeLink?.value === props.href);
    return () => {
      const { href, target } = props;
      const wrapperClassName = clsx(
        `${prefixCls.value}-link`,
        (attrs as any).class,
        mergedClassNames?.value?.item,
        {
          [`${prefixCls.value}-link-active`]: active.value,
        },
      );

      const titleClassName = clsx(
        `${prefixCls.value}-link-title`,
        mergedClassNames?.value?.itemTitle,
        {
          [`${prefixCls.value}-link-title-active`]: active.value,
        },
      );
      const title = getSlotPropsFnRun(slots, props, 'title');

      return (
        <div class={[wrapperClassName]} style={mergedStyles?.value?.item}>
          <a
            class={titleClassName}
            href={href}
            onClick={handleClick}
            style={mergedStyles?.value?.itemTitle}
            target={target}
            title={typeof title === 'string' ? title : ''}
          >
            {title}
          </a>
          {direction?.value === 'horizontal' ? null : slots?.default?.()}
        </div>
      );
    };
  },
  {
    inheritAttrs: false,
  },
);

export default AnchorLink;
