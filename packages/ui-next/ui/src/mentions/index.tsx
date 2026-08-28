import type { App, CSSProperties, SlotsType } from 'vue';

import type {
  DataDrivenOptionProps as VcMentionsOptionProps,
  MentionsProps as VcMentionsProps,
  MentionsRef as VcMentionsRef,
} from '@arvin-studio/headless';

import type { VueNode } from '../_util';
import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type { InputStatus } from '../_util/statusUtils';
import type { ComponentBaseProps, Variant } from '../config-provider/context';
import type { SizeType } from '../config-provider/size-context';

import { computed, defineComponent, shallowRef } from 'vue';

import {
  filterEmpty,
  MentionsOption,
  Mentions as VcMentions,
} from '@arvin-studio/headless';
import { clsx, omit } from '@arvin-studio/kit';

import getAllowClear from '../_util/getAllowClear';
import {
  getAttrStyleAndClass,
  useMergeSemantic,
  useSemanticRootStyle,
  useToArr,
  useToProps,
} from '../_util/hooks';
import { useZIndex } from '../_util/hooks/useZIndex';
import genPurePanel from '../_util/PurePanel';
import { getMergedStatus, getStatusClassNames } from '../_util/statusUtils';
import toList from '../_util/toList';
import { getSlotPropsFnRun, toPropsRefs } from '../_util/tools';
import { devUseWarning, isDev } from '../_util/warning';
import { useComponentBaseConfig } from '../config-provider/context';
import { DefaultRenderEmpty } from '../config-provider/default-render-empty';
import { useDisabledContext } from '../config-provider/disabled-context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import { useSize } from '../config-provider/hooks/useSize';
import { useFormItemInputContext } from '../form/context';
import useVariant from '../form/hooks/useVariant';
import Spin from '../spin';
import useStyle from './style';

function loadingFilterOption() {
  return true;
}

const Option = MentionsOption;
export { Option };

export type MentionPlacement = 'bottom' | 'top';

export interface OptionProps {
  [key: string]: any;
  // children: ReactNode;
  content?: VueNode;
  value: string;
}

export type MentionSemanticName = keyof MentionSemanticClassNames &
  keyof MentionSemanticStyles;

export interface MentionSemanticClassNames {
  popup?: string;
  root?: string;
  suffix?: string;
  textarea?: string;
}

export interface MentionSemanticStyles {
  popup?: CSSProperties;
  root?: CSSProperties;
  suffix?: CSSProperties;
  textarea?: CSSProperties;
}

export type MentionsClassNamesType = SemanticClassNamesType<
  MentionProps,
  MentionSemanticClassNames
>;

export type MentionsStylesType = SemanticStylesType<
  MentionProps,
  MentionSemanticStyles
>;

export interface MentionsOptionProps extends VcMentionsOptionProps {
  content?: VueNode;
}

export interface MentionProps
  extends
    ComponentBaseProps,
    /* @vue-ignore */
    MentionsEmitsProps,
    Omit<
      VcMentionsProps,
      | 'className'
      | 'classNames'
      | 'onBlur'
      | 'onChange'
      | 'onFocus'
      | 'onPopupScroll'
      | 'onSearch'
      | 'onSelect'
      | 'styles'
      | 'suffix'
    > {
  allowClear?:
    | boolean
    | {
        clearIcon?: VueNode;
      };
  classes?: MentionsClassNamesType;
  disabled?: boolean;
  labelRender?: (ctx: { index: number; option: MentionsOptionProps }) => any;
  loading?: boolean;
  options?: MentionsOptionProps[];
  popupClassName?: string;
  size?: SizeType;
  status?: InputStatus;
  styles?: MentionsStylesType;
  /**
   * @since 5.13.0
   * @default "outlined"
   */
  variant?: Variant;
}

export interface MentionsEmits {
  blur: (event: FocusEvent) => void;
  change: (value: string) => void;
  focus: (event: FocusEvent) => void;
  popupScroll: (event: Event) => void;
  search: (text: string, prefix: string) => void;
  select: (option: MentionsOptionProps, prefix: string) => void;
  'update:value': (value: string) => void;
}
export interface MentionsEmitsProps {
  onBlur?: MentionsEmits['blur'];
  onChange?: MentionsEmits['change'];
  onFocus?: MentionsEmits['focus'];
  onPopupScroll?: MentionsEmits['popupScroll'];
  onSearch?: MentionsEmits['search'];
  onSelect?: MentionsEmits['select'];
  'onUpdate:value'?: MentionsEmits['update:value'];
}

export interface MentionsSlots {
  default?: () => any;
  labelRender?: (ctx: { index: number; option: MentionsOptionProps }) => any;
  suffix?: () => any;
}

export interface MentionsProps extends MentionProps {}

export interface MentionsRef extends VcMentionsRef {}

interface MentionsConfig {
  prefix?: string | string[];
  split?: string;
}

interface MentionsEntity {
  prefix: string;
  value: string;
}

const omitKeys: string[] = [
  'prefixCls',
  'classes',
  'styles',
  'rootClass',
  'size',
  'status',
  'loading',
  'labelRender',
  'contentRender',
  'variant',
  'allowClear',
  'filterOption',
  'popupClassName',
  'options',
  'notFoundContent',
];

const InternalMentions = defineComponent<
  MentionProps,
  MentionsEmits,
  string,
  SlotsType<MentionsSlots>
>(
  (props, { slots, emit, expose, attrs }) => {
    if (isDev) {
      const warning = devUseWarning('Mentions');
      warning.deprecated(!slots.default, 'Mentions.Option', 'options');
    }

    const {
      prefixCls,
      direction,
      class: contextClassName,
      style: contextStyle,
      classes: contextClassNames,
      styles: contextStyles,
      renderEmpty,
      getPopupContainer,
    } = useComponentBaseConfig('mentions', props);

    const {
      classes,
      styles,
      rootClass,
      size: customSize,
      disabled: customDisabled,
      status: customStatus,
      variant: customVariant,
    } = toPropsRefs(
      props,
      'classes',
      'styles',
      'rootClass',
      'size',
      'disabled',
      'status',
      'variant',
    );

    const rootCls = useCSSVarCls(prefixCls);
    const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

    const mergedSize = useSize(customSize);

    const disabledContext = useDisabledContext();
    const mergedDisabled = computed(
      () => customDisabled.value ?? disabledContext.value,
    );

    const formItemInputContext = useFormItemInputContext();
    const hasFeedback = computed(() => formItemInputContext.value.hasFeedback);
    const feedbackIcon = computed(
      () => formItemInputContext.value.feedbackIcon,
    );
    const mergedStatus = computed(() =>
      getMergedStatus(formItemInputContext.value.status, customStatus.value),
    );

    const mergedProps = computed(() => {
      return {
        ...props,
        disabled: mergedDisabled.value,
        status: mergedStatus.value,
        loading: props.loading,
        options: props.options,
        variant: customVariant.value,
      } as MentionProps;
    });

    const contextStyleRoot = useSemanticRootStyle(contextStyle);
    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      MentionsClassNamesType,
      MentionsStylesType,
      MentionProps
    >(
      useToArr(contextClassNames, classes),
      useToArr(contextStyles, contextStyleRoot as any, styles),
      useToProps(mergedProps),
    );

    const mergedAllowClear = computed(() => getAllowClear(props.allowClear));

    const [mergedVariant, enableVariasCls] = useVariant(
      'mentions',
      customVariant,
    );

    const focused = shallowRef(false);

    const setFocusState = (value: boolean) => {
      focused.value = value;
    };

    const handleFocus = (event: FocusEvent) => {
      setFocusState(true);
      emit('focus', event);
    };

    const handleBlur = (event: FocusEvent) => {
      setFocusState(false);
      emit('blur', event);
    };

    const handleChange = (value: string) => {
      emit('update:value', value);
      emit('change', value);
    };

    const handleSelect = (option: VcMentionsOptionProps, prefix: string) => {
      emit('select', option as MentionsOptionProps, prefix);
    };

    const handleSearch = (text: string, prefix: string) => {
      emit('search', text, prefix);
    };

    const handlePopupScroll = (event: Event) => {
      emit('popupScroll', event);
    };

    // ====================== zIndex ======================
    const popupZIndexProp = computed(
      () => (props.styles as any)?.popup?.zIndex as number | undefined,
    );
    const [mentionsZIndex] = useZIndex('SelectLike', popupZIndexProp);

    const notFoundContent = computed(() => {
      if (props.notFoundContent !== undefined) {
        return props.notFoundContent;
      }
      return (
        renderEmpty?.value?.('Select') || (
          <DefaultRenderEmpty componentName="Select" />
        )
      );
    });

    const mergedFilterOption = computed(() =>
      props.loading ? loadingFilterOption : props.filterOption,
    );

    const resolveRenderNode = (
      key: 'labelRender',
      ctx: { index: number; option: MentionsOptionProps },
    ) => {
      const node = getSlotPropsFnRun(slots, props, key, false, ctx);
      return node === undefined ? undefined : node;
    };

    const mergedOptions = computed(() => {
      if (props.loading) {
        return [
          {
            value: 'ANTD_SEARCHING',
            disabled: true,
            label: <Spin size="small" />,
          },
        ];
      }
      if (!props.options) {
        return undefined;
      }
      return props.options.map((option, index) => {
        const labelNode = resolveRenderNode('labelRender', { option, index });
        const mergedLabel = labelNode ?? option.label ?? option.value;
        return {
          ...option,
          label: mergedLabel,
        };
      });
    });

    const mentionsRef = shallowRef<VcMentionsRef>();
    expose({
      focus: () => mentionsRef.value?.focus?.(),
      blur: () => mentionsRef.value?.blur?.(),
      textarea: computed(() => mentionsRef.value?.textarea || null),
      nativeElement: computed(() => mentionsRef.value?.nativeElement),
    });

    return () => {
      const { className, style, restAttrs } = getAttrStyleAndClass(attrs);
      const mergedClassName = clsx(
        {
          [`${prefixCls.value}-sm`]: mergedSize.value === 'small',
          [`${prefixCls.value}-lg`]: mergedSize.value === 'large',
        },
        contextClassName.value,
        mergedClassNames.value.root,
        rootClass.value,
        cssVarCls.value,
        rootCls.value,
        hashId.value,
        className,
      );

      const rootStyle = {
        ...mergedStyles.value.root,
        ...style,
      };

      const suffixNodes = filterEmpty(slots.suffix?.() ?? []).filter(
        (node) => node !== null,
      );
      if (hasFeedback.value && feedbackIcon.value) {
        suffixNodes.push(feedbackIcon.value);
      }
      const mergedSuffix = suffixNodes.length > 0 ? suffixNodes : undefined;

      const mentionOptions = props.loading ? (
        <MentionsOption disabled value="ASD_SEARCHING">
          <Spin size="small" />
        </MentionsOption>
      ) : props.options === undefined ? (
        filterEmpty(slots.default?.() ?? []).filter(Boolean)
      ) : null;

      const mergedPopupClassName = clsx(
        mergedClassNames.value.popup,
        rootClass.value,
        hashId.value,
        cssVarCls.value,
        rootCls.value,
      );

      const classNames = {
        mentions: clsx(
          {
            [`${prefixCls.value}-disabled`]: mergedDisabled.value,
            [`${prefixCls.value}-focused`]: focused.value,
            [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
          },
          hashId.value,
        ),
        textarea: clsx(mergedClassNames.value.textarea),
        popup: mergedPopupClassName,
        suffix: mergedClassNames.value.suffix,
        variant: clsx(
          {
            [`${prefixCls.value}-${mergedVariant.value}`]:
              enableVariasCls.value,
          },
          getStatusClassNames(prefixCls.value, mergedStatus.value),
        ),
        affixWrapper: hashId.value,
      };
      const popupStyle = mergedStyles.value.popup as CSSProperties | undefined;
      const mergedStylesValue = {
        textarea: mergedStyles.value.textarea,
        popup: {
          ...popupStyle,
          zIndex: popupStyle?.zIndex ?? mentionsZIndex.value,
        } as CSSProperties,
        suffix: mergedStyles.value.suffix,
      };

      const restProps = omit(props, omitKeys as any);
      return (
        <VcMentions
          ref={mentionsRef as any}
          {...restAttrs}
          {...restProps}
          allowClear={mergedAllowClear.value}
          className={mergedClassName}
          classNames={classNames as any}
          direction={direction.value}
          disabled={mergedDisabled.value}
          filterOption={mergedFilterOption.value as any}
          getPopupContainer={props.getPopupContainer || getPopupContainer}
          notFoundContent={notFoundContent.value}
          onBlur={handleBlur}
          onChange={handleChange}
          onFocus={handleFocus}
          onPopupScroll={handlePopupScroll}
          onSearch={handleSearch}
          onSelect={handleSelect}
          options={mergedOptions.value as any}
          popupClassName={props.popupClassName}
          prefixCls={prefixCls.value}
          silent={props.loading}
          style={rootStyle}
          styles={mergedStylesValue as any}
          suffix={mergedSuffix}
        >
          {mentionOptions}
        </VcMentions>
      );
    };
  },
  {
    name: 'AsMentions',
    inheritAttrs: false,
  },
);

const Mentions = InternalMentions as typeof InternalMentions & {
  _InternalPanelDoNotUseOrYouWillBeFired: any;
  getMentions: (value: string, config?: MentionsConfig) => MentionsEntity[];
  install: (app: App) => void;
  Option: typeof Option;
};

Mentions.Option = Option;

Mentions.install = (app: App): void => {
  app.component(Mentions.name, Mentions);
  app.component('AsMentionsOption', Option);
};

Mentions.getMentions = (
  value = '',
  config: MentionsConfig = {},
): MentionsEntity[] => {
  const { prefix = '@', split = ' ' } = config;
  const prefixList: string[] = toList(prefix);

  return value.split(split).reduce<MentionsEntity[]>((list, str = '') => {
    let hitPrefix: null | string = null;

    prefixList.some((prefixStr) => {
      const startStr = str.slice(0, prefixStr.length);
      if (startStr === prefixStr) {
        hitPrefix = prefixStr;
        return true;
      }
      return false;
    });

    if (hitPrefix !== null) {
      const entity = {
        prefix: hitPrefix,
        value: str.slice((hitPrefix as string).length),
      };
      if (entity.value) {
        list.push(entity);
      }
    }
    return list;
  }, []);
};

// We don't care debug panel
/* istanbul ignore next */
const PurePanel = genPurePanel(Mentions, undefined, undefined, 'mentions');
(Mentions as any)._InternalPanelDoNotUseOrYouWillBeFired = PurePanel;

export default Mentions;
