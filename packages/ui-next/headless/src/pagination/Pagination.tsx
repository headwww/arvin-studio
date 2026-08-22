import type { Ref, VNode } from 'vue';

import type { VueNode } from '../util';
import type { PaginationProps } from './interface';

import {
  computed,
  defineComponent,
  h,
  isVNode,
  ref,
  toRef,
  watchEffect,
} from 'vue';

import { clsx } from '@arvin-studio/kit';

import { getAttrStyleAndClass, pickAttrs } from '../util';
import useMergedState from '../util/hooks/useMergedState';
import KeyCode from '../util/KeyCode';
import { cloneElement } from '../util/vnode';
import isEnterOrSpaceKey from './isEnterOrSpaceKey';
import zhCN from './locale/zh_CN';
import Options from './Options';
import Pager from './Pager';

function isInteger(v: number) {
  const value = v;
  return (
    typeof value === 'number' &&
    !Number.isNaN(value) &&
    isFinite(value) &&
    Number.isSafeInteger(value)
  );
}
const defaultItemRender: PaginationProps['itemRender'] = (
  _page,
  _type,
  element,
) => element;
function calculatePage(p: number | undefined, pageSize: number, total: number) {
  const _pageSize = p === undefined ? pageSize : p;
  return Math.floor((total - 1) / _pageSize) + 1;
}

const paginationDefaults = {
  prefixCls: 'headless-pagination',
  selectPrefixCls: 'headless-select',
  defaultCurrent: 1,
  total: 0,
  defaultPageSize: 10,
  showPrevNextJumpers: true,
  showTitle: true,
  locale: zhCN,
  totalBoundaryShowSizeChanger: 50,
} as const;

const Pagination = defineComponent<PaginationProps>(
  (props, { attrs }) => {
    const paginationRef = ref<HTMLUListElement>();

    const mergedPrefixCls = computed(
      () => props.prefixCls ?? paginationDefaults.prefixCls,
    );
    const mergedSelectPrefixCls = computed(
      () => props.selectPrefixCls ?? paginationDefaults.selectPrefixCls,
    );
    const mergedLocale = computed(
      () => props.locale ?? paginationDefaults.locale,
    );
    const mergedTotal = computed(() => props.total ?? paginationDefaults.total);
    const mergedShowPrevNextJumpers = computed(
      () => props.showPrevNextJumpers ?? paginationDefaults.showPrevNextJumpers,
    );
    const mergedShowTitle = computed(
      () => props.showTitle ?? paginationDefaults.showTitle,
    );
    const mergedTotalBoundaryShowSizeChanger = computed(
      () =>
        props.totalBoundaryShowSizeChanger ??
        paginationDefaults.totalBoundaryShowSizeChanger,
    );

    const pageSizeProp = toRef(props, 'pageSize');
    const [pageSize, setPageSize] = useMergedState(
      paginationDefaults.defaultPageSize,
      {
        value: pageSizeProp as Ref<number>,
        defaultValue:
          props.defaultPageSize ?? paginationDefaults.defaultPageSize,
      },
    );

    const currentProp = toRef(props, 'current');
    const allPages = computed(() =>
      calculatePage(undefined, pageSize.value!, mergedTotal.value),
    );
    const [current, setCurrent] = useMergedState(
      paginationDefaults.defaultCurrent,
      {
        value: currentProp as Ref<number>,
        defaultValue: props.defaultCurrent ?? paginationDefaults.defaultCurrent,
        postState: (c: number | undefined) =>
          Math.max(
            1,
            Math.min(
              c ?? 1,
              calculatePage(undefined, pageSize.value!, mergedTotal.value),
            ),
          ),
      },
    );

    const internalInputVal = ref(current.value);
    watchEffect(() => {
      internalInputVal.value = current.value;
    });

    function getValidValue(e: any): number {
      const inputValue = e.target.value;
      const allPages = calculatePage(
        undefined,
        pageSize.value,
        mergedTotal.value,
      );
      let value: number;
      if (inputValue === '') {
        value = inputValue;
      } else if (Number.isNaN(Number(inputValue))) {
        value = internalInputVal.value;
      } else if (inputValue >= allPages) {
        value = allPages;
      } else {
        value = Number(inputValue);
      }
      return value;
    }

    function isValid(page: number) {
      return (
        isInteger(page) &&
        page !== current.value &&
        isInteger(mergedTotal.value) &&
        mergedTotal.value > 0
      );
    }

    // The accessible name now lives on the wrapping `li` (which carries
    // `role="button"`), so the inner control is hidden from the a11y tree to
    // avoid announcing it twice. `title` is the visual tooltip only.
    function getItemIcon(icon: VueNode, _label: string, title?: string) {
      const prefixCls = mergedPrefixCls.value;
      const iconNode =
        typeof icon === 'function'
          ? h(icon, { ...props })
          : icon || (
              <button
                aria-hidden="true"
                class={`${prefixCls}-item-link`}
                tabindex={-1}
                title={title}
                type="button"
              />
            );
      return iconNode as VNode;
    }

    const prevPage = computed(() => Math.max(current.value - 1, 0));
    const nextPage = computed(() =>
      Math.min(current.value + 1, allPages.value),
    );

    const jumpPrevPage = computed(() =>
      Math.max(1, current.value - (props.showLessItems ? 3 : 5)),
    );
    const jumpNextPage = computed(() =>
      Math.min(
        calculatePage(undefined, pageSize.value, mergedTotal.value),
        current.value + (props.showLessItems ? 3 : 5),
      ),
    );
    const hasPrev = computed(() => current.value > 1);
    const hasNext = computed(
      () =>
        current.value <
        calculatePage(undefined, pageSize.value, mergedTotal.value),
    );
    const goButton = computed(
      () => props.showQuickJumper && (props.showQuickJumper as any).goButton,
    );

    function handleChange(page: number | undefined) {
      if (page !== undefined && isValid(page) && !props.disabled) {
        const currentPage = calculatePage(
          undefined,
          pageSize.value,
          mergedTotal.value,
        );
        let newPage = page;
        if (page > currentPage) {
          newPage = currentPage;
        } else if (page < 1) {
          newPage = 1;
        }

        if (newPage !== internalInputVal.value) {
          internalInputVal.value = newPage;
        }

        setCurrent(newPage);
        props.onChange?.(newPage, pageSize.value);

        return newPage;
      }

      return current.value;
    }

    function prevHandle() {
      if (hasPrev.value) handleChange(current.value - 1);
    }

    function nextHandle() {
      if (hasNext.value) handleChange(current.value + 1);
    }

    function jumpPrevHandle() {
      handleChange(jumpPrevPage.value);
    }

    function jumpNextHandle() {
      handleChange(jumpNextPage.value);
    }

    function runIfEnterOrSpace(
      event: KeyboardEvent,
      callback: (...args: any[]) => void,
      ...restParams: any[]
    ) {
      if (!isEnterOrSpaceKey(event)) {
        return;
      }

      // These are `li`s acting as buttons; Space would otherwise scroll.
      event.preventDefault();
      callback(...restParams);
    }

    function runIfEnterPrev(event: KeyboardEvent) {
      runIfEnterOrSpace(event, prevHandle);
    }

    function runIfEnterNext(event: KeyboardEvent) {
      runIfEnterOrSpace(event, nextHandle);
    }

    function runIfEnterJumpPrev(event: KeyboardEvent) {
      runIfEnterOrSpace(event, jumpPrevHandle);
    }

    function runIfEnterJumpNext(event: KeyboardEvent) {
      runIfEnterOrSpace(event, jumpNextHandle);
    }

    function renderPrev(prevPage: number) {
      const itemRender = props.itemRender || defaultItemRender;
      const prevPageTitle = mergedLocale.value.prev_page || 'prev page';
      const prevButton = itemRender?.(
        prevPage,
        'prev',
        getItemIcon(
          props.prevIcon,
          prevPageTitle,
          mergedShowTitle.value ? prevPageTitle : undefined,
        ),
      );
      const nextProps: Record<string, any> = {};
      if (!hasPrev.value) {
        nextProps.disabled = true;
      }
      return isVNode(prevButton)
        ? cloneElement(prevButton, nextProps)
        : prevButton;
    }

    function renderNext(nextPage: number) {
      const itemRender = props.itemRender || defaultItemRender;
      const nextPageTitle = mergedLocale.value.next_page || 'next page';
      const nextButton = itemRender?.(
        nextPage,
        'next',
        getItemIcon(
          props.nextIcon,
          nextPageTitle,
          mergedShowTitle.value ? nextPageTitle : undefined,
        ),
      );
      const nextProps: Record<string, any> = {};
      if (!hasNext.value) {
        nextProps.disabled = true;
      }
      return isVNode(nextButton)
        ? cloneElement(nextButton, nextProps)
        : nextButton;
    }

    function handleGoTO(event: Event) {
      if (
        event.type === 'click' ||
        (event as KeyboardEvent).keyCode === KeyCode.ENTER
      ) {
        handleChange(internalInputVal.value);
      }
    }

    /**
     * prevent "up arrow" key reseting cursor position within textbox
     * @see https://stackoverflow.com/a/1081114
     */
    function handleKeyDown(event: KeyboardEvent) {
      // eslint-disable-next-line unicorn/prefer-keyboard-event-key
      if (event.keyCode === KeyCode.UP || event.keyCode === KeyCode.DOWN) {
        event.preventDefault();
      }
    }

    function handleKeyUp(event: Event) {
      const value = getValidValue(event);
      if (value !== internalInputVal.value) {
        internalInputVal.value = value;
      }

      switch ((event as KeyboardEvent).keyCode) {
        case KeyCode.DOWN: {
          handleChange(value + 1);
          break;
        }
        case KeyCode.ENTER: {
          handleChange(value);
          break;
        }
        case KeyCode.UP: {
          handleChange(value - 1);
          break;
        }
        default: {
          break;
        }
      }
    }

    function handleBlur(event: FocusEvent) {
      handleChange(getValidValue(event));
    }

    function changePageSize(size: number) {
      // The page that keeps the first currently-visible record in view after the
      // resize — reported as `recommendPage` so callers can opt into following it.
      const preservedPage =
        Math.floor(((current.value - 1) * pageSize.value) / size) + 1;
      const newCurrent = calculatePage(size, pageSize.value, mergedTotal.value);
      const recommendPage =
        newCurrent === 0 ? 1 : Math.min(preservedPage, newCurrent);

      const nextCurrent =
        current.value > newCurrent && newCurrent !== 0
          ? newCurrent
          : current.value;

      setPageSize(size);
      internalInputVal.value = nextCurrent;
      props.onShowSizeChange?.(current.value, size);
      setCurrent(nextCurrent);
      props.onChange?.(nextCurrent, size, { recommendPage });
    }

    const shouldDisplayQuickJumper = computed(() =>
      mergedTotal.value > pageSize.value ? props.showQuickJumper : false,
    );

    return () => {
      const {
        align,
        simple,
        showTotal,
        showLessItems,
        jumpPrevIcon,
        jumpNextIcon,
        pageSizeOptions,
        disabled,
        classNames: paginationClassNames,
        styles,
        hideOnSinglePage,
        sizeChangerRender,
        showSizeChanger: showSizeChangerProp,
        totalBoundaryShowSizeChanger,
        itemRender,
      } = props;

      const prefixCls = mergedPrefixCls.value;
      const selectPrefixCls = mergedSelectPrefixCls.value;
      const locale = mergedLocale.value;
      const total = mergedTotal.value;
      const showTitle = mergedShowTitle.value;
      const showPrevNextJumpers = mergedShowPrevNextJumpers.value;
      const totalBoundary =
        totalBoundaryShowSizeChanger ??
        mergedTotalBoundaryShowSizeChanger.value;
      const showSizeChanger = showSizeChangerProp ?? total > totalBoundary;
      const mergedItemRender = itemRender || defaultItemRender;

      const { style, className } = getAttrStyleAndClass(attrs);
      const dataOrAriaAttributeProps = pickAttrs(attrs, {
        aria: true,
        data: true,
      });

      // ================== Render ==================
      // When hideOnSinglePage is true and there is only 1 page, hide the pager
      if (hideOnSinglePage && total <= pageSize.value) {
        return null;
      }

      const itemClassName = paginationClassNames?.item;
      const itemStyle = styles?.item;

      let prev = renderPrev(prevPage.value);
      if (prev) {
        const prevDisabled = !hasPrev.value || !allPages.value;
        prev = (
          <li
            aria-disabled={prevDisabled}
            aria-label={locale?.prev_page}
            class={clsx(`${prefixCls}-prev`, itemClassName, {
              [`${prefixCls}-disabled`]: prevDisabled,
            })}
            onClick={prevHandle}
            onKeydown={runIfEnterPrev}
            role="button"
            style={itemStyle}
            tabindex={prevDisabled ? undefined : 0}
          >
            {prev}
          </li>
        );
      }

      let next = renderNext(nextPage.value);
      if (next) {
        let nextDisabled: boolean, nextTabIndex: null | number;

        if (simple) {
          nextDisabled = !hasNext.value;
          nextTabIndex = hasPrev.value ? 0 : null;
        } else {
          nextDisabled = !hasNext.value || !allPages.value;
          nextTabIndex = nextDisabled ? null : 0;
        }

        next = (
          <li
            aria-disabled={nextDisabled}
            aria-label={locale?.next_page}
            class={clsx(`${prefixCls}-next`, itemClassName, {
              [`${prefixCls}-disabled`]: nextDisabled,
            })}
            onClick={nextHandle}
            onKeydown={runIfEnterNext}
            role="button"
            style={itemStyle}
            tabindex={nextTabIndex ?? undefined}
          >
            {next}
          </li>
        );
      }

      const totalText = showTotal && (
        <li class={`${prefixCls}-total-text`}>
          {showTotal(total, [
            total === 0 ? 0 : (current.value - 1) * pageSize.value + 1,
            Math.min(current.value * pageSize.value, total),
          ])}
        </li>
      );

      // ========================== Simple ============================
      const isReadOnly = typeof simple === 'object' ? simple.readOnly : !simple;
      let gotoButton: any = goButton.value;

      let simplePager: null | VNode = null;
      if (simple) {
        if (goButton.value) {
          gotoButton =
            typeof goButton.value === 'boolean' ? (
              <button onClick={handleGoTO} onKeyup={handleGoTO} type="button">
                {locale?.jump_to_confirm}
              </button>
            ) : (
              <span onClick={handleGoTO} onKeyup={handleGoTO}>
                {goButton.value}
              </span>
            );

          gotoButton = (
            <li
              class={`${prefixCls}-simple-pager`}
              title={
                showTitle
                  ? `${locale?.jump_to}${current.value}/${allPages.value}`
                  : undefined
              }
            >
              {gotoButton}
            </li>
          );
        }
        simplePager = (
          <li
            class={clsx(`${prefixCls}-simple-pager`, itemClassName)}
            style={itemStyle}
            title={showTitle ? `${current.value}/${allPages.value}` : undefined}
          >
            {isReadOnly ? (
              internalInputVal.value
            ) : (
              <input
                aria-label={locale?.jump_to}
                disabled={disabled}
                onBlur={handleBlur}
                onChange={handleKeyUp}
                onKeydown={handleKeyDown}
                onKeyup={handleKeyUp}
                size={3}
                type="text"
                value={internalInputVal.value}
              />
            )}
            <span class={`${prefixCls}-slash`}>/</span>
            {allPages.value}
          </li>
        );
      }

      // ====================== Normal ======================
      const pagerProps: any = {
        rootPrefixCls: prefixCls,
        onClick: handleChange,
        onKeyPress: runIfEnterOrSpace,
        showTitle,
        itemRender: mergedItemRender,
        pageLabel: locale?.page,
        page: -1,
        className: itemClassName,
        style: itemStyle,
      };

      const pagerList: (null | VNode)[] = [];
      const pageBufferSize = showLessItems ? 1 : 2;
      if (allPages.value <= 3 + pageBufferSize * 2) {
        if (!allPages.value) {
          pagerList.push(
            <Pager
              {...pagerProps}
              className={`${prefixCls}-item-disabled`}
              key="noPager"
              page={1}
            />,
          );
        }

        for (let i = 1; i <= allPages.value; i += 1) {
          pagerList.push(
            <Pager
              {...pagerProps}
              active={current.value === i}
              key={i}
              page={i}
            />,
          );
        }
      } else {
        const prevItemTitle = showLessItems ? locale?.prev_3 : locale?.prev_5;
        const nextItemTitle = showLessItems ? locale?.next_3 : locale?.next_5;

        const jumpPrevContent = mergedItemRender(
          jumpPrevPage.value,
          'jump-prev',
          getItemIcon(
            jumpPrevIcon,
            prevItemTitle!,
            showTitle ? prevItemTitle : undefined,
          ),
        );
        const jumpNextContent = mergedItemRender(
          jumpNextPage.value,
          'jump-next',
          getItemIcon(
            jumpNextIcon,
            nextItemTitle!,
            showTitle ? nextItemTitle : undefined,
          ),
        );
        let jumpPrev = null;
        let jumpNext = null;

        if (showPrevNextJumpers) {
          jumpPrev = jumpPrevContent ? (
            <li
              aria-label={prevItemTitle}
              class={clsx(`${prefixCls}-jump-prev`, {
                [`${prefixCls}-jump-prev-custom-icon`]: !!jumpPrevIcon,
              })}
              key="prev"
              onClick={jumpPrevHandle}
              onKeydown={runIfEnterJumpPrev}
              role="button"
              tabindex={0}
            >
              {jumpPrevContent}
            </li>
          ) : null;

          jumpNext = jumpNextContent ? (
            <li
              aria-label={nextItemTitle}
              class={clsx(`${prefixCls}-jump-next`, {
                [`${prefixCls}-jump-next-custom-icon`]: !!jumpNextIcon,
              })}
              key="next"
              onClick={jumpNextHandle}
              onKeydown={runIfEnterJumpNext}
              role="button"
              tabindex={0}
            >
              {jumpNextContent}
            </li>
          ) : null;
        }
        let left = Math.max(1, current.value - pageBufferSize);
        let right = Math.min(current.value + pageBufferSize, allPages.value);

        if (current.value - 1 <= pageBufferSize) {
          right = 1 + pageBufferSize * 2;
        }
        if (allPages.value - current.value <= pageBufferSize) {
          left = allPages.value - pageBufferSize * 2;
        }

        const hasJumpPrev =
          !!jumpPrev &&
          current.value - 1 >= pageBufferSize * 2 &&
          current.value !== 1 + 2;
        const hasJumpNext =
          !!jumpNext &&
          allPages.value - current.value >= pageBufferSize * 2 &&
          current.value !== allPages.value - 2;

        if (!showLessItems && hasJumpPrev && right !== allPages.value) {
          left += 1;
        }
        if (!showLessItems && hasJumpNext && left !== 1) {
          right -= 1;
        }

        for (let i = left; i <= right; i += 1) {
          pagerList.push(
            <Pager
              {...pagerProps}
              active={current.value === i}
              key={i}
              page={i}
            />,
          );
        }

        if (hasJumpPrev) {
          if (pagerList[0]) {
            pagerList[0] = cloneElement(pagerList[0], {
              className: clsx(
                `${prefixCls}-item-after-jump-prev`,
                pagerList[0].props?.className,
              ),
            });
          }
          pagerList.unshift(jumpPrev);
        }

        if (hasJumpNext) {
          const lastOne = pagerList[pagerList.length - 1];
          if (lastOne) {
            pagerList[pagerList.length - 1] = cloneElement(lastOne, {
              className: clsx(
                `${prefixCls}-item-before-jump-next`,
                lastOne.props?.className,
              ),
            });
          }
          pagerList.push(jumpNext);
        }

        if (left !== 1) {
          pagerList.unshift(<Pager {...pagerProps} key={1} page={1} />);
        }
        if (right !== allPages.value) {
          pagerList.push(
            <Pager
              {...pagerProps}
              key={allPages.value}
              page={allPages.value}
            />,
          );
        }
      }

      const cls = clsx(prefixCls, props.className, className, {
        [`${prefixCls}-start`]: align === 'start',
        [`${prefixCls}-center`]: align === 'center',
        [`${prefixCls}-end`]: align === 'end',
        [`${prefixCls}-simple`]: simple,
        [`${prefixCls}-disabled`]: disabled,
      });

      return (
        <ul
          class={cls}
          ref={paginationRef}
          style={style}
          {...dataOrAriaAttributeProps}
        >
          {totalText}
          {prev}
          {simple ? simplePager : pagerList}
          {next}
          <Options
            changeSize={changePageSize}
            disabled={disabled}
            goButton={gotoButton}
            locale={locale}
            pageSize={pageSize.value}
            pageSizeOptions={pageSizeOptions}
            quickGo={shouldDisplayQuickJumper.value ? handleChange : undefined}
            rootPrefixCls={prefixCls}
            selectPrefixCls={selectPrefixCls}
            showSizeChanger={showSizeChanger}
            sizeChangerRender={sizeChangerRender}
          />
        </ul>
      );
    };
  },
  { name: 'VCPagination', inheritAttrs: false },
);

export default Pagination;
