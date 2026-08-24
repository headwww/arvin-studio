import type { KeyboardEventHandler, MouseEventHandler, VueNode } from '../util';
import type { Status, StepItem, StepsProps } from './Steps';

import { defineComponent } from 'vue';

import { clsx } from '@arvin-studio/kit';

import KeyCode from '../util/KeyCode';
import { useStepsContext } from './Context';
import Rail from './Rail';
import StepIcon, { StepIconSemanticContextProvider } from './StepIcon';
import { useUnstableContext } from './UnstableContext';

function hasContent<T>(value: T) {
  return value !== undefined && value !== null;
}

export interface StepProps {
  active?: boolean;
  classNames: StepsProps['classNames'];
  // data
  data: StepItem;

  icon?: VueNode;
  // render
  iconRender?: StepsProps['iconRender'];
  index: number;
  itemRender?: StepsProps['itemRender'];
  itemWrapperRender?: StepsProps['itemWrapperRender'];

  last: boolean;
  nextStatus?: Status;
  // Event
  onClick?: (index: number) => void;
  // style
  prefixCls?: string;

  styles: StepsProps['styles'];
}

const Step = defineComponent<StepProps>(
  (props) => {
    const { railFollowPrevStatus } = useUnstableContext();
    const stepsContext = useStepsContext();
    return () => {
      const { ItemComponent } = stepsContext.value ?? {};
      const {
        // style
        prefixCls,
        classNames = {},
        styles = {},

        // data
        data,
        last,
        nextStatus,
        active,
        index,

        // render
        itemRender,
        iconRender,
        itemWrapperRender,

        // events
        onClick,
      } = props;
      const itemCls = `${prefixCls}-item`;

      // ========================== Data ==========================
      const {
        onClick: onItemClick,
        title,
        subTitle,
        content,
        description,
        disabled,
        icon,
        status,

        class: className,
        style,
        classNames: itemClassNames = {},
        styles: itemStyles = {},

        ...restItemProps
      } = data;

      const mergedContent = content ?? description;

      const renderInfo = {
        item: {
          ...data,
          content: mergedContent,
        },
        index,
        active,
      };

      // ========================= Click ==========================
      const clickable = !!(onClick || onItemClick) && !disabled;

      const accessibilityProps: {
        onClick?: MouseEventHandler;
        onKeydown?: KeyboardEventHandler;
        role?: string;
        tabindex?: number;
      } = {};

      if (clickable) {
        accessibilityProps.role = 'button';
        accessibilityProps.tabindex = 0;
        accessibilityProps.onClick = (e: MouseEvent) => {
          onItemClick?.(e);
          onClick?.(index);
        };

        accessibilityProps.onKeydown = (e: KeyboardEvent) => {
          // eslint-disable-next-line unicorn/prefer-keyboard-event-key
          const { which } = e;
          if (which === KeyCode.ENTER || which === KeyCode.SPACE) {
            onClick?.(index);
          }
        };
      }

      // ========================= Render =========================
      const mergedStatus = status || 'wait';

      const hasTitle = hasContent(title);
      const hasSubTitle = hasContent(subTitle);

      const classString = clsx(
        itemCls,
        `${itemCls}-${mergedStatus}`,
        {
          [`${itemCls}-custom`]: icon,
          [`${itemCls}-active`]: active,
          [`${itemCls}-disabled`]: disabled === true,
          [`${itemCls}-empty-header`]: !hasTitle && !hasSubTitle,
        },
        className,
        classNames?.item,
        itemClassNames.root,
      );
      let iconNode = <StepIcon />;

      if (iconRender) {
        iconNode = iconRender(iconNode, {
          ...renderInfo,
          components: {
            Icon: StepIcon,
          },
        } as any);
      }
      const wrapperNode = (
        <div
          class={clsx(
            `${itemCls}-wrapper`,
            classNames?.itemWrapper,
            itemClassNames.wrapper,
          )}
          style={{ ...styles.itemWrapper, ...itemStyles.wrapper }}
        >
          {/* Icon */}
          <StepIconSemanticContextProvider
            value={{
              className: itemClassNames.icon,
              style: itemStyles.icon,
            }}
          >
            {iconNode}
          </StepIconSemanticContextProvider>

          <div
            class={clsx(
              `${itemCls}-section`,
              classNames.itemSection,
              itemClassNames.section,
            )}
            style={{ ...styles.itemSection, ...itemStyles.section }}
          >
            <div
              class={clsx(
                `${itemCls}-header`,
                classNames.itemHeader,
                itemClassNames.header,
              )}
              style={{ ...styles.itemHeader, ...itemStyles.header }}
            >
              {hasTitle && (
                <div
                  class={clsx(
                    `${itemCls}-title`,
                    classNames.itemTitle,
                    itemClassNames.title,
                  )}
                  style={{ ...styles.itemTitle, ...itemStyles.title }}
                >
                  {title}
                </div>
              )}
              {hasSubTitle && (
                <div
                  class={clsx(
                    `${itemCls}-subtitle`,
                    classNames.itemSubtitle,
                    itemClassNames.subtitle,
                  )}
                  style={{ ...styles.itemSubtitle, ...itemStyles.subtitle }}
                  title={typeof subTitle === 'string' ? subTitle : undefined}
                >
                  {subTitle}
                </div>
              )}

              {!last && (
                <Rail
                  className={clsx(classNames.itemRail, itemClassNames.rail)}
                  prefixCls={itemCls}
                  status={railFollowPrevStatus?.value ? status! : nextStatus!}
                  style={{ ...styles.itemRail, ...itemStyles.rail }}
                />
              )}
            </div>
            {hasContent(mergedContent) && (
              <div
                class={clsx(
                  `${itemCls}-content`,
                  classNames.itemContent,
                  itemClassNames.content,
                )}
                style={{ ...styles.itemContent, ...itemStyles.content }}
              >
                {mergedContent}
              </div>
            )}
          </div>
        </div>
      );

      let stepNode: any = (
        <ItemComponent
          {...restItemProps}
          {...accessibilityProps}
          class={classString}
          style={{
            ...styles.item,
            ...itemStyles.root,
            ...style,
          }}
        >
          {itemWrapperRender ? itemWrapperRender(wrapperNode) : wrapperNode}
        </ItemComponent>
      );

      if (itemRender) {
        stepNode = (itemRender(stepNode, renderInfo as any) || null) as any;
      }

      return stepNode;
    };
  },
  {
    name: 'Step',
    inheritAttrs: false,
  },
);

export default Step;
