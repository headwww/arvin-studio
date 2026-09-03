import type { App, SlotsType } from 'vue';

import type { PaginationProps as VcPaginationProps } from '@arvin-studio/headless';

import type { VueNode } from '../_util';
import type {
  PaginationClassNamesType,
  PaginationEmits,
  PaginationProps,
  PaginationSlots,
  PaginationStylesType,
} from './interface';

import { computed, defineComponent } from 'vue';

import {
  Pagination_zh_Cn as enUS,
  getAttrStyleAndClass,
  Pagination as VcPagination,
} from '@arvin-studio/headless';
import {
  DoubleLeftOutlined,
  DoubleRightOutlined,
  EllipsisOutlined,
  LeftOutlined,
  RightOutlined,
} from '@arvin-studio/icons';
import { clsx, omit } from '@arvin-studio/kit';

import {
  useMergeSemantic,
  useSemanticRootStyle,
  useToArr,
  useToProps,
} from '../_util/hooks';
import { getSlotPropsFnRun, toPropsRefs } from '../_util/tools';
import { devUseWarning, isDev } from '../_util/warning';
import { useComponentBaseConfig } from '../config-provider/context';
import { useSize } from '../config-provider/hooks/useSize';
import useVariant from '../form/hooks/useVariant';
import useBreakpoint from '../grid/hooks/useBreakpoint';
import useLocale from '../locale/useLocale';
import Select from '../select';
import { useToken } from '../theme/internal';
import useStyle from './style';
import BorderedStyle from './style/bordered';
import resolveShowSizeChanger from './useShowSizeChanger';

const omitKeys = [
  'size',
  'responsive',
  'rootClass',
  'classes',
  'styles',
  'showSizeChanger',
  'pageSizeOptions',
  'selectComponentClass',
];

export interface InternalPaginationProps /* @vue-ignore */
  extends PaginationEmitsProps, PaginationProps {}

export interface PaginationEmitsProps {
  onChange?: PaginationEmits['change'];
  onShowSizeChange?: PaginationEmits['showSizeChange'];
  'onUpdate:current'?: PaginationEmits['update:current'];
  'onUpdate:pageSize'?: PaginationEmits['update:pageSize'];
}

const Pagination = defineComponent<
  InternalPaginationProps,
  PaginationEmits,
  string,
  SlotsType<PaginationSlots>
>(
  (props, { slots, attrs, emit }) => {
    const {
      getPrefixCls,
      prefixCls,
      direction,
      class: contextClassName,
      style: contextStyle,
      classes: contextClassNames,
      styles: contextStyles,
      showSizeChanger: contextShowSizeChangerConfig,
    } = useComponentBaseConfig('pagination', props, ['showSizeChanger']);

    const { size, responsive, classes, styles, showSizeChanger } = toPropsRefs(
      props,
      'size',
      'responsive',
      'classes',
      'styles',
      'showSizeChanger',
    );

    const [hashId, cssVarCls] = useStyle(prefixCls, prefixCls);
    const [, token] = useToken();

    // ============================== Size ==============================
    const mergedSize = useSize(size);
    const screens = useBreakpoint(responsive as any);
    const isSmall = computed(
      () =>
        mergedSize.value === 'small' ||
        (!!screens.value?.xs && !mergedSize.value && responsive.value),
    );
    const [inputVariant, enableInputVariasCls] = useVariant('input');

    // =========== Merged Props for Semantic ==========
    const mergedProps = computed(() => {
      return {
        ...props,
        size: mergedSize.value,
      } as PaginationProps;
    });

    // ========================= Style ==========================
    const contextStyleRoot = useSemanticRootStyle(contextStyle);
    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      PaginationClassNamesType,
      PaginationStylesType,
      PaginationProps
    >(
      useToArr(contextClassNames, classes),
      useToArr(contextStyles, contextStyleRoot as any, styles),
      useToProps(mergedProps),
    );

    // ============================= Locale =============================
    const [contextLocale] = useLocale('Pagination', enUS);
    const mergedLocale = computed(() => ({
      ...contextLocale?.value,
      ...props.locale,
    }));

    // ========================== Size Changer ==========================
    const propShowSizeChanger = computed(() =>
      resolveShowSizeChanger(showSizeChanger.value),
    );
    const contextShowSizeChanger = computed(() =>
      resolveShowSizeChanger(contextShowSizeChangerConfig.value),
    );
    const mergedShowSizeChanger = computed(
      () => propShowSizeChanger.value.show ?? contextShowSizeChanger.value.show,
    );
    const mergedShowSizeChangerSelectProps = computed(
      () =>
        propShowSizeChanger.value.selectProps ??
        contextShowSizeChanger.value.selectProps,
    );

    const SizeChanger = computed(() => props.selectComponentClass || Select);

    const mergedPageSizeOptions = computed(() =>
      props.pageSizeOptions?.map(Number),
    );

    const sizeChangerRender: NonNullable<
      VcPaginationProps['sizeChangerRender']
    > = (info) => {
      const {
        disabled,
        size: pageSize,
        onSizeChange,
        'aria-label': ariaLabel,
        className: sizeChangerClassName,
        options,
      } = info;

      const selectProps = mergedShowSizeChangerSelectProps.value ?? {};
      const propSelectClass =
        (selectProps as any).class ?? (selectProps as any).className;
      const propSelectOnChange = (selectProps as any).onChange;

      const selectedValue = options.find(
        (option) => String(option.value) === String(pageSize),
      )?.value;
      const SizeChangerComp = SizeChanger.value;
      return (
        <SizeChangerComp
          aria-label={ariaLabel}
          disabled={disabled}
          getPopupContainer={(triggerNode: HTMLElement) =>
            triggerNode.parentNode as HTMLElement
          }
          options={options}
          popupMatchSelectWidth={false}
          showSearch
          {...selectProps}
          class={clsx(
            `${prefixCls.value}-options-size-changer-select`,
            sizeChangerClassName,
            propSelectClass,
          )}
          onChange={(nextSize: number | string, option: any) => {
            onSizeChange?.(nextSize);
            propSelectOnChange?.(nextSize, option);
          }}
          size={mergedSize.value}
          value={selectedValue}
        />
      );
    };

    if (isDev) {
      const warning = devUseWarning('Pagination');
      warning(
        !props.selectComponentClass,
        'usage',
        '`selectComponentClass` is not official api which will be removed.',
      );
    }

    const selectPrefixCls = computed(() =>
      getPrefixCls('select', props.selectPrefixCls),
    );

    // ============================= Render =============================
    const defaultEllipsis = computed(() => (
      <span class={`${prefixCls.value}-item-ellipsis`}>
        <EllipsisOutlined />
      </span>
    ));

    const defaultPrevIcon = computed(() => (
      <button
        class={`${prefixCls.value}-item-link`}
        tabindex={-1}
        type="button"
      >
        {direction.value === 'rtl' ? <RightOutlined /> : <LeftOutlined />}
      </button>
    ));

    const defaultNextIcon = computed(() => (
      <button
        class={`${prefixCls.value}-item-link`}
        tabindex={-1}
        type="button"
      >
        {direction.value === 'rtl' ? <LeftOutlined /> : <RightOutlined />}
      </button>
    ));

    const defaultJumpPrevIcon = computed(() => (
      <a class={`${prefixCls.value}-item-link`}>
        <div class={`${prefixCls.value}-item-container`}>
          {direction.value === 'rtl' ? (
            <DoubleRightOutlined class={`${prefixCls.value}-item-link-icon`} />
          ) : (
            <DoubleLeftOutlined class={`${prefixCls.value}-item-link-icon`} />
          )}
          {defaultEllipsis.value}
        </div>
      </a>
    ));

    const defaultJumpNextIcon = computed(() => (
      <a class={`${prefixCls.value}-item-link`}>
        <div class={`${prefixCls.value}-item-container`}>
          {direction.value === 'rtl' ? (
            <DoubleLeftOutlined class={`${prefixCls.value}-item-link-icon`} />
          ) : (
            <DoubleRightOutlined class={`${prefixCls.value}-item-link-icon`} />
          )}
          {defaultEllipsis.value}
        </div>
      </a>
    ));

    const mergedPrevIcon = computed(
      () =>
        getSlotPropsFnRun(slots, props, 'prevIcon', false) ??
        defaultPrevIcon.value,
    );
    const mergedNextIcon = computed(
      () =>
        getSlotPropsFnRun(slots, props, 'nextIcon', false) ??
        defaultNextIcon.value,
    );
    const mergedJumpPrevIcon = computed(
      () =>
        getSlotPropsFnRun(slots, props, 'jumpPrevIcon', false) ??
        defaultJumpPrevIcon.value,
    );
    const mergedJumpNextIcon = computed(
      () =>
        getSlotPropsFnRun(slots, props, 'jumpNextIcon', false) ??
        defaultJumpNextIcon.value,
    );

    const mergedItemRender = computed<VcPaginationProps['itemRender']>(() => {
      if (slots.itemRender) {
        return (page, type, element) => {
          return getSlotPropsFnRun(slots, {}, 'itemRender', true, {
            page,
            type,
            element,
          });
        };
      }
      return props.itemRender;
    });

    const mergedShowTotal = computed<VcPaginationProps['showTotal']>(() => {
      if (slots.showTotal) {
        return (total, range) => {
          return getSlotPropsFnRun(slots, {}, 'showTotal', true, {
            total,
            range,
          });
        };
      }
      return props.showTotal;
    });

    const handleChange: NonNullable<VcPaginationProps['onChange']> = (
      page,
      pageSize,
    ) => {
      if (props.current !== page) {
        emit('update:current', page);
      }
      if (props.pageSize !== pageSize) {
        emit('update:pageSize', pageSize);
      }
      emit('change', page, pageSize);
    };

    const handleShowSizeChange: NonNullable<
      VcPaginationProps['onShowSizeChange']
    > = (current, size) => {
      emit('showSizeChange', current, size);
    };

    return () => {
      const { rootClass, align } = props;
      const { className, style, restAttrs } = getAttrStyleAndClass(attrs);

      const extendedClassName = clsx(
        {
          [`${prefixCls.value}-${align}`]: !!align,
          [`${prefixCls.value}-${mergedSize.value}`]: mergedSize.value,
          [`${prefixCls.value}-${inputVariant.value}`]:
            enableInputVariasCls.value && inputVariant.value !== 'outlined',
          /** @deprecated Should be removed in v2 */
          [`${prefixCls.value}-mini`]: isSmall.value,
          [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
          [`${prefixCls.value}-bordered`]: token.value.wireframe,
        },
        contextClassName.value,
        className,
        rootClass,
        mergedClassNames.value.root,
        hashId.value,
        cssVarCls.value,
      );

      const mergedStyle = {
        ...mergedStyles.value?.root,
        ...style,
      };

      const restProps = omit(props, omitKeys);

      return (
        <>
          {token.value.wireframe && (
            <BorderedStyle prefixCls={prefixCls.value} />
          )}
          <VcPagination
            {...restProps}
            {...restAttrs}
            class={extendedClassName}
            classNames={mergedClassNames.value}
            itemRender={mergedItemRender.value}
            jumpNextIcon={mergedJumpNextIcon.value as VueNode}
            jumpPrevIcon={mergedJumpPrevIcon.value as VueNode}
            locale={mergedLocale.value}
            nextIcon={mergedNextIcon.value as VueNode}
            onChange={handleChange}
            onShowSizeChange={handleShowSizeChange}
            pageSizeOptions={mergedPageSizeOptions.value}
            prefixCls={prefixCls.value}
            prevIcon={mergedPrevIcon.value as VueNode}
            selectPrefixCls={selectPrefixCls.value}
            showSizeChanger={mergedShowSizeChanger.value}
            showTotal={mergedShowTotal.value}
            sizeChangerRender={sizeChangerRender}
            style={mergedStyle}
            styles={mergedStyles.value as any}
          />
        </>
      );
    };
  },
  {
    name: 'AsPagination',
    inheritAttrs: false,
  },
);

(Pagination as any).install = (app: App) => {
  app.component(Pagination.name, Pagination);
};

export default Pagination;
