/* eslint-disable no-useless-assignment */
import type { VueNode } from '../_util';

import {
  CheckOutlined,
  CloseCircleFilled,
  CloseOutlined,
  DownOutlined,
  LoadingOutlined,
  SearchOutlined,
} from '@arvin-studio/icons';

import { getSlotPropsFnRun } from '../_util/tools';
import { devUseWarning, isDev } from '../_util/warning';

type RenderNode = VueNode;

export default function useIcons({
  suffixIcon,
  clearIcon,
  menuItemSelectedIcon,
  removeIcon,
  loading,
  loadingIcon,
  multiple,
  hasFeedback,
  showSuffixIcon,
  feedbackIcon,
  showArrow,
  componentName,
}: {
  clearIcon?: RenderNode;
  componentName: string;
  feedbackIcon?: VueNode;
  hasFeedback?: boolean;
  loading?: boolean;
  loadingIcon?: any;
  menuItemSelectedIcon?: RenderNode;
  multiple?: boolean;
  prefixCls: string;
  removeIcon?: RenderNode;
  showArrow?: boolean;
  showSuffixIcon?: boolean;
  suffixIcon?: VueNode;
}) {
  if (isDev) {
    const warning = devUseWarning(componentName);

    warning.deprecated(
      !clearIcon,
      'clearIcon',
      'allowClear={{ clearIcon: VueNode }}',
    );
  }

  // Clear Icon
  const mergedClearIcon = clearIcon ?? <CloseCircleFilled />;

  // Validation Feedback Icon
  const getSuffixIconNode = (arrowIcon?: VueNode) => {
    if (suffixIcon === null && !hasFeedback && !showArrow) {
      return null;
    }
    arrowIcon = getSlotPropsFnRun({}, { arrowIcon }, 'arrowIcon');
    return (
      <>
        {showSuffixIcon !== false && arrowIcon}
        {hasFeedback && feedbackIcon}
      </>
    );
  };

  // Arrow item icon
  let mergedSuffixIcon = null;
  if (suffixIcon !== undefined) {
    mergedSuffixIcon = getSuffixIconNode(suffixIcon);
  } else if (loading) {
    mergedSuffixIcon = getSuffixIconNode(
      loadingIcon ?? <LoadingOutlined spin />,
    );
  } else {
    mergedSuffixIcon = ({
      open,
      showSearch,
    }: {
      open: boolean;
      showSearch: boolean;
    }) => {
      if (open && showSearch) {
        return getSuffixIconNode(<SearchOutlined />);
      }
      return getSuffixIconNode(<DownOutlined />);
    };
  }

  // Checked item icon
  let mergedItemIcon = null;
  if (menuItemSelectedIcon !== undefined) {
    mergedItemIcon = menuItemSelectedIcon;
  } else if (multiple) {
    mergedItemIcon = <CheckOutlined />;
  } else {
    mergedItemIcon = null;
  }

  let mergedRemoveIcon = null;
  mergedRemoveIcon = removeIcon === undefined ? <CloseOutlined /> : removeIcon;
  return {
    // TODO: remove as when all the deps bumped
    clearIcon: mergedClearIcon as VueNode,
    suffixIcon: mergedSuffixIcon,
    itemIcon: mergedItemIcon,
    removeIcon: mergedRemoveIcon,
  };
}
