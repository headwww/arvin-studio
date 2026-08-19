/**
 * getAllowClear 清除按钮配置归一化
 *
 * 用途：把 Input 的 allowClear 统一归一化为 { clearIcon } 配置对象，
 * 供展示层直接消费：
 * - 传入 { clearIcon } 对象时原样返回，允许自定义清除图标；
 * - 传入 true（或任意真值）时补上默认的 CloseCircleFilled 清除图标；
 * - 传入 false / undefined 时返回 undefined，表示不展示清除按钮。
 *
 * 典型用法见 Input：props.allowClear 与 ConfigProvider 上下文的 allowClear
 * 合并后统一经此归一化，再交给清除图标的渲染逻辑。
 */
import type { BaseInputProps } from '@arvin-studio/headless';

import { CloseCircleFilled } from '@arvin-studio/icons';

export type AllowClear = BaseInputProps['allowClear'];

function getAllowClear(allowClear: AllowClear): AllowClear {
  let mergedAllowClear: AllowClear;
  if (typeof allowClear === 'object' && allowClear?.clearIcon) {
    // 对象且自带 clearIcon：原样使用，尊重自定义清除图标
    mergedAllowClear = allowClear;
  } else if (allowClear) {
    // 其余真值：补上默认的 CloseCircleFilled 清除图标
    mergedAllowClear = {
      clearIcon: <CloseCircleFilled />,
    };
  }

  return mergedAllowClear;
}

export default getAllowClear;
