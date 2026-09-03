/**
 * @v-c/util RenderComponent —— 命令式"渲染任意内容"的组件
 *
 * 用途：把通过 props.render 传入的内容（函数 / VNode 数组 / 单个 VNode /
 * 基础类型）渲染到当前组件所在位置，并把 attrs（class/style 等透传属性）
 * 合并进每个 VNode。
 *
 * 典型场景：某些 API 允许"传函数渲染"（如列自定义渲染、命令式挂载内容），
 * RenderComponent 作为统一执行器；数组形式会先 filterEmpty 过滤空节点，
 * 再逐个注入 attrs。
 */
import { createVNode, defineComponent, isVNode } from 'vue';

import { filterEmpty } from './props-util';

/**
 * 是否为"基础类型"内容：string / number / boolean / undefined / null
 * （基础类型无需注入 attrs，原样渲染）
 */
function checkIsBaseType(value: any) {
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return true;
  }
  return value === undefined || value === null;
}
export const RenderComponent = defineComponent<{
  render?: any;
}>(
  (props, { attrs }) => {
    return () => {
      const render = props.render;
      // 情况 1：render 是函数 → 调用执行
      if (render && typeof render === 'function') {
        const _render = (render as any)?.();
        if (Array.isArray(_render)) {
          // 函数返回数组：过滤空节点，逐个 VNode 注入 attrs
          const arr = filterEmpty(_render);
          return arr.map((v) => {
            return isVNode(v)
              ? createVNode(v, {
                  ...attrs,
                })
              : v;
          });
        }
        return _render;
      }
      // 情况 2：render 是数组 → 直接作为节点列表处理
      else if (Array.isArray(render)) {
        const arr = filterEmpty(render);
        return arr.map((v) => {
          if (isVNode(v)) {
            return createVNode(v, {
              ...attrs,
            });
          }
          return v;
        });
      }
      // 情况 3：基础类型 → 原样渲染（如纯文本内容）
      else if (checkIsBaseType(render)) {
        return render;
      }

      // 情况 4：单个 VNode → 注入 attrs 后渲染
      if (isVNode(render)) {
        return createVNode(render, {
          ...attrs,
        });
      }
      // 其他（undefined 等）原样返回
      return render;
    };
  },
  {
    name: 'RenderComponent',
    inheritAttrs: false,
    props: ['render'],
  },
);
