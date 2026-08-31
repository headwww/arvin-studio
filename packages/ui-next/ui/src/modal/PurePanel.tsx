import type { SlotsType } from 'vue';

import type { DialogProps } from '@arvin-studio/headless';

import type {
  ModalClassNamesType,
  ModalFuncProps,
  ModalStylesType,
} from './interface';

import { computed, defineComponent } from 'vue';

import { Panel, toPropsRefs } from '@arvin-studio/headless';
import { clsx } from '@arvin-studio/kit';

import {
  getAttrStyleAndClass,
  useMergeSemantic,
  useToArr,
  useToProps,
} from '../_util/hooks';
import { withPureRenderTheme } from '../_util/PurePanel';
import { getSlotPropsFnRun } from '../_util/tools';
import { useComponentBaseConfig } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import { ConfirmContent } from './ConfirmDialog';
import { Footer, renderCloseIcon } from './shared';
import useStyle from './style';

export interface PurePanelProps
  extends
    Omit<
      DialogProps,
      'classNames' | 'footer' | 'prefixCls' | 'style' | 'styles' | 'visible'
    >,
    Pick<ModalFuncProps, 'footer' | 'type'>,
    /* @vue-ignore */
    PurePanelEmitsProps {
  classes?: ModalClassNamesType;
  prefixCls?: string;
  rootClass?: string;
  styles?: ModalStylesType;
}

export interface PurePanelEmitsProps {}

export interface PurePanelSlots {
  closeIcon?: () => any;
  default?: () => any;
  footer?: (params: {
    extra: { CancelBtn: any; OkBtn: any };
    originNode: any;
  }) => any;
  title?: () => any;
}

const PurePanel = defineComponent<
  PurePanelProps,
  Record<string, never>,
  string,
  SlotsType<PurePanelSlots>
>(
  (props, { slots, attrs }) => {
    const {
      prefixCls,
      getPrefixCls,
      styles: contextStyles,
      classes: contextClassNames,
      class: contextClassName,
      style: contextStyle,
    } = useComponentBaseConfig('modal', props, []);
    const { classes, styles } = toPropsRefs(props, 'classes', 'styles');
    const rootPrefixCls = computed(() => getPrefixCls(undefined, ''));

    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      ModalClassNamesType,
      ModalStylesType,
      PurePanelProps
    >(
      useToArr(contextClassNames, classes),
      useToArr(contextStyles, styles),
      useToProps(computed(() => props)),
    );
    const rootCls = useCSSVarCls(rootPrefixCls);
    const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

    const confirmPrefixCls = computed(() => `${prefixCls.value}-confirm`);

    return () => {
      const {
        className: attrClassName,
        restAttrs,
        style: attrStyle,
      } = getAttrStyleAndClass(attrs);
      const { type, closable, closeIcon } = props;
      const footer = getSlotPropsFnRun(slots, props, 'footer', false);
      const title = getSlotPropsFnRun(slots, props, 'title', false);
      // Choose target props by confirm mark
      let additionalProps: Partial<DialogProps> = {};
      additionalProps = type
        ? {
            closable: closable ?? false,
            title: '',
            footer: '',
            children: (
              <ConfirmContent
                {...(props as any)}
                confirmPrefixCls={confirmPrefixCls.value}
                content={slots.default?.()}
                prefixCls={prefixCls.value}
                rootPrefixCls={rootPrefixCls.value}
              />
            ),
          }
        : {
            closable: closable ?? true,
            title,
            footer: footer !== null && <Footer {...props} footer={footer} />,
            children: slots.default?.(),
          };
      return (
        <Panel
          animationVisible={true}
          className={clsx(
            hashId.value,
            `${prefixCls.value}-pure-panel`,
            type && confirmPrefixCls.value,
            type && `${confirmPrefixCls.value}-${type}`,
            attrClassName,
            contextClassName.value,
            cssVarCls.value,
            rootCls.value,
            props.rootClass,
            mergedClassNames.value?.root,
          )}
          prefixCls={prefixCls.value}
          style={[contextStyle, mergedStyles.value?.root, attrStyle]}
          {...(restAttrs as any)}
          closable={closable}
          closeIcon={renderCloseIcon(
            prefixCls.value,
            slots.closeIcon || closeIcon,
          )}
          visible={true}
          {...additionalProps}
          classNames={mergedClassNames.value}
          styles={mergedStyles.value}
          v-slots={{
            default: () => additionalProps.children,
          }}
        />
      );
    };
  },
  {
    name: 'AsModalPurePanel',
    inheritAttrs: false,
  },
);

export default withPureRenderTheme(PurePanel);
