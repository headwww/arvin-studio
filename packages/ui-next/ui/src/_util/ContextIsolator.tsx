/**
 * ContextIsolator 上下文隔离组件
 *
 * 用途：把子树与外层注入的上下文隔离开——
 * Input 的 addonBefore / addonAfter 等节点虽然渲染在组件内部，
 * 但语义上并不属于外层 Form / Space.Compact 的管辖范围，
 * 若不隔离会错误地继承外层的校验状态样式或紧凑拼接样式。
 *
 * 核心机制（依赖注入式隔离，而非 prop 层层传递）：
 * - form：用 NoFormStyle 覆盖 status，让子树退出表单校验状态样式
 *   （NoFormStyle 尚未实现，先以 TODO 占位）；
 * - space：用 NoCompactStyle 注入 null 上下文，让子树显式退出
 *   Space.Compact 紧凑拼接样式；
 * - 渲染前先 filterEmpty 过滤空子节点，无内容时直接返回 null，
 *   不产生多余的包装节点。
 */
import { defineComponent } from 'vue';

import { filterEmpty } from '@arvin-studio/headless';

import { NoCompactStyle } from '../space/Compact';

export const ContextIsolator = defineComponent<{
  /** 是否隔离 Form 校验状态上下文（依赖 NoFormStyle，尚未实现，暂为 TODO 占位） */
  form?: boolean;
  /** 是否隔离 Space.Compact 紧凑拼接上下文 */
  space?: boolean;
}>((props, { slots }) => {
  return () => {
    const { space, form } = props;
    const children = filterEmpty(slots?.default?.());
    if (children.length === 0) {
      return null;
    }
    let result: any = children;
    if (form) {
      // TODO(NoFormStyle): 表单样式隔离待 NoFormStyle 落地后启用，
      // 届时用 <NoFormStyle override status> 包裹，让 addon 不继承 Form 的校验状态样式
      // result = (
      //     <NoFormStyle override status>
      //         {result}
      //     </NoFormStyle>
      // );
    }

    if (space) {
      // 注入 null 上下文，让子树显式退出 Space.Compact 紧凑拼接样式
      result = <NoCompactStyle>{result}</NoCompactStyle>;
    }
    return result;
  };
});
