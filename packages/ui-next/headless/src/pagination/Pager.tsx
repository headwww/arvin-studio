import type { CSSProperties } from 'vue';

import type { PaginationProps } from './interface';

import { defineComponent } from 'vue';

import { clsx } from '@arvin-studio/kit';

export interface PagerProps extends Pick<PaginationProps, 'itemRender'> {
  active?: boolean;
  className?: string;
  onClick?: (page: number) => void;
  onKeyPress?: (
    e: KeyboardEvent,
    onClick: PagerProps['onClick'],
    page: PagerProps['page'],
  ) => void;
  page: number;
  /** Localized word for "page", prefixed to the number in the accessible name. */
  pageLabel?: string;
  rootPrefixCls: string;
  showTitle: boolean;
  style?: CSSProperties;
}

const Pager = defineComponent<PagerProps>((props) => {
  const handleClick = () => {
    props.onClick?.(props.page);
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    props.onKeyPress?.(e, props.onClick, props.page);
  };

  return () => {
    const {
      rootPrefixCls,
      page,
      pageLabel,
      active,
      className,
      showTitle,
      itemRender,
      style,
    } = props;
    const prefixCls = `${rootPrefixCls}-item`;

    const cls = clsx(
      prefixCls,
      `${prefixCls}-${page}`,
      {
        [`${prefixCls}-active`]: active,
        [`${prefixCls}-disabled`]: !page,
      },
      className,
    );

    // The `li` below carries `role="button"` and the accessible name, so the
    // inner anchor is hidden from the a11y tree to avoid a duplicate reading.
    const pager = itemRender?.(
      page,
      'page',
      <a aria-hidden="true" rel="nofollow" tabindex={-1}>
        {page}
      </a>,
    );
    const pagerLabel = `${pageLabel ?? ''} ${page}`.trim();

    return pager ? (
      <li
        aria-current={active ? 'page' : undefined}
        aria-label={pagerLabel}
        class={cls}
        onClick={handleClick}
        onKeydown={handleKeyPress}
        role="button"
        style={style}
        tabindex={0}
        title={showTitle ? String(page) : undefined}
      >
        {pager}
      </li>
    ) : null;
  };
});

export default Pager;
