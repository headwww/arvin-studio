import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';

import { clsx } from '@arvin-studio/kit';

import { usePanelContext } from '../../context';
import useScrollTo from './useScrollTo';

const SCROLL_DELAY = 300;

export interface Unit<ValueType = number | string> {
  disabled?: boolean;
  label: any;
  value: ValueType;
}

function flattenUnits(units: Unit<number | string>[]) {
  return units
    .map(({ value, label, disabled }) => [value, label, disabled].join(','))
    .join(';');
}

export interface TimeColumnProps {
  changeOnScroll?: boolean;
  onChange: (value: number | string) => void;
  onDblClick?: VoidFunction;
  onHover: (value: number | string) => void;
  optionalValue?: number | string;
  type: 'hour' | 'meridiem' | 'millisecond' | 'minute' | 'second';
  units: Unit[];
  value?: number | string;
}

const TimeColumn = defineComponent<TimeColumnProps>(
  (props) => {
    const context = usePanelContext();
    const ulRef = ref<HTMLUListElement>();
    const checkDelayRef = ref<any>();

    const clearDelayCheck = () => {
      clearTimeout(checkDelayRef.value);
    };

    const [syncScroll, stopScroll, isScrolling] = useScrollTo(
      ulRef,
      computed(() => props.value ?? props.optionalValue),
    );

    watch(
      [
        () => props.value,
        () => props.optionalValue,
        () => flattenUnits(props.units),
      ],
      () => {
        syncScroll();
        clearDelayCheck();
      },
      { flush: 'post' },
    );

    onMounted(() => {
      syncScroll();
    });

    onBeforeUnmount(() => {
      stopScroll();
      clearDelayCheck();
    });

    const onInternalScroll = (event: Event) => {
      clearDelayCheck();
      const target = event.target as HTMLUListElement;

      if (!isScrolling() && props.changeOnScroll) {
        checkDelayRef.value = setTimeout(() => {
          const ul = ulRef.value!;
          const firstLi = ul.querySelector(`li`) as HTMLLIElement;
          const firstLiTop = firstLi.offsetTop;
          const liList = Array.from(
            ul.querySelectorAll(`li`),
          ) as HTMLLIElement[];
          const liTopList = liList.map((li) => li.offsetTop - firstLiTop);
          const liDistList = liTopList.map((top, index) => {
            if (props.units[index]!.disabled) {
              return Number.MAX_SAFE_INTEGER;
            }
            return Math.abs(top - target.scrollTop);
          });

          const minDist = Math.min(...liDistList);
          const minDistIndex = liDistList.indexOf(minDist);
          const targetUnit = props.units[minDistIndex];
          if (targetUnit && !targetUnit.disabled) {
            props.onChange(targetUnit.value);
          }
        }, SCROLL_DELAY);
      }
    };

    return () => {
      const { units, value, type, onChange, onHover, onDblClick } = props;
      const {
        prefixCls,
        cellRender,
        now,
        locale,
        classNames: panelClassNames,
        styles,
      } = context!.value;

      const panelPrefixCls = `${prefixCls}-time-panel`;
      const cellPrefixCls = `${prefixCls}-time-panel-cell`;
      const columnPrefixCls = `${panelPrefixCls}-column`;

      return (
        <ul
          class={columnPrefixCls}
          data-type={type}
          onScroll={onInternalScroll}
          ref={ulRef}
        >
          {units.map(({ label, value: unitValue, disabled }) => {
            const inner = <div class={`${cellPrefixCls}-inner`}>{label}</div>;

            return (
              <li
                class={clsx(cellPrefixCls, panelClassNames?.item, {
                  [`${cellPrefixCls}-selected`]: value === unitValue,
                  [`${cellPrefixCls}-disabled`]: disabled,
                })}
                data-value={unitValue}
                key={unitValue}
                onClick={() => {
                  if (!disabled) {
                    onChange(unitValue);
                  }
                }}
                onDblclick={() => {
                  if (!disabled && onDblClick) {
                    onDblClick();
                  }
                }}
                onMouseenter={() => {
                  onHover(unitValue);
                }}
                onMouseleave={() => {
                  onHover(null!);
                }}
                style={styles?.item}
              >
                {cellRender
                  ? cellRender(unitValue, {
                      prefixCls,
                      originNode: inner,
                      today: now,
                      type: 'time',
                      subType: type,
                      locale,
                    })
                  : inner}
              </li>
            );
          })}
        </ul>
      );
    };
  },
  {
    name: 'TimeColumn',
  },
);

export default TimeColumn;
