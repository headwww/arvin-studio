import type { ComponentBaseProps } from '../config-provider/context';

import { createVNode, defineComponent, ref } from 'vue';

import { filterEmpty } from '@arvin-studio/headless';
import { clsx } from '@arvin-studio/kit';

import { useBaseConfig, useComponentConfig } from '../config-provider/context';
import { useLayoutProvider } from './context';
import useHasSider from './hooks/useHasSider';
import useStyle from './style';

export interface GeneratorProps {
  displayName: string;
  suffixCls?: string;
  tagName: 'div' | 'footer' | 'header' | 'main';
}

export interface BasicProps extends ComponentBaseProps {
  hasSider?: boolean;
  suffixCls?: string;
}

interface BasicPropsWithTagName extends BasicProps {
  tagName: 'div' | 'footer' | 'header' | 'main';
}
const basicDefaultProps = {
  hasSider: undefined,
} as any;
function generator({ suffixCls, tagName, displayName }: GeneratorProps) {
  return (BasicComponent: any) => {
    return defineComponent<BasicProps>(
      (props = basicDefaultProps, { attrs, slots }) => {
        return () => {
          return (
            <BasicComponent
              {...props}
              suffixCls={props?.suffixCls ?? suffixCls}
              tagName={tagName}
              {...attrs}
              v-slots={slots}
            />
          );
        };
      },
      {
        name: displayName,
        inheritAttrs: false,
      },
    );
  };
}

const Basic = defineComponent<BasicPropsWithTagName>(
  (props = basicDefaultProps, { attrs, slots }) => {
    const { prefixCls } = useBaseConfig('layout', props);
    const [hashId, cssVarCls] = useStyle(prefixCls);

    return () => {
      const { suffixCls, tagName, prefixCls: customizePrefixCls } = props;
      const prefixWithSuffixCls = suffixCls
        ? `${prefixCls.value}-${suffixCls}`
        : prefixCls.value;
      const { class: _attrClass, ...restAttrs } = attrs as Record<string, any>;

      return createVNode(
        tagName,
        {
          ...restAttrs,
          class: clsx(
            customizePrefixCls || prefixWithSuffixCls,
            _attrClass,
            hashId.value,
            cssVarCls.value,
          ),
        },
        slots,
      );
    };
  },
  {
    inheritAttrs: false,
  },
);

const BasicLayout = defineComponent<BasicPropsWithTagName>(
  (props = basicDefaultProps, { slots, attrs }) => {
    const { direction, prefixCls } = useBaseConfig('layout', props);
    const compCtx = useComponentConfig('layout');
    const siders = ref<string[]>([]);
    const [hashId, cssVarCls] = useStyle(prefixCls);
    const addSider = (id: string) => {
      siders.value = [...siders.value, id];
    };

    const removeSider = (id: string) => {
      siders.value = siders.value.filter((currentId) => currentId !== id);
    };

    useLayoutProvider({
      siderHook: {
        addSider,
        removeSider,
      },
    });

    return () => {
      const { hasSider, rootClass, tagName, suffixCls } = props;
      const children = filterEmpty(slots?.default?.() || []);
      const mergedHasSider = useHasSider(siders.value, children, hasSider);
      const {
        class: _attrClass,
        style: attrStyle,
        ...restAttrs
      } = attrs as Record<string, any>;

      const classString = clsx(
        prefixCls.value,
        {
          [`${prefixCls.value}-has-sider`]: mergedHasSider,
          [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
        },
        compCtx.value.class,
        rootClass,
        _attrClass,
        hashId.value,
        cssVarCls.value,
      );

      return createVNode(
        tagName,
        {
          ...restAttrs,
          suffixCls,
          class: classString,
          style: [compCtx.value.style, attrStyle],
        },
        {
          default: () => children,
        },
      );
    };
  },
  {
    inheritAttrs: false,
  },
);

const Layout = generator({
  tagName: 'div',
  displayName: 'AsLayout',
})(BasicLayout);

const Header = generator({
  suffixCls: 'header',
  tagName: 'header',
  displayName: 'AsLayoutHeader',
})(Basic);

const Footer = generator({
  suffixCls: 'footer',
  tagName: 'footer',
  displayName: 'AsLayoutFooter',
})(Basic);

const Content = generator({
  suffixCls: 'content',
  tagName: 'main',
  displayName: 'AsLayoutContent',
})(Basic);

export { Content, Footer, Header };

export default Layout;
