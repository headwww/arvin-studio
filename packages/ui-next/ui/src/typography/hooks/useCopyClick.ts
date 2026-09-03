import { onBeforeUnmount, shallowRef, unref } from 'vue';

import copy from '../../_util/copy';
import toList from '../../_util/toList';
import { getTextByNode } from '../../_util/vueNode';

function useCopyClick({
  copyConfig,
  getText,
}: {
  copyConfig: any;
  getText?: () => any;
}) {
  // 是否处于"已复制"态（3 秒后复位）
  const copied = shallowRef(false);

  // 复制进行中
  const copyLoading = shallowRef(false);

  // "已复制"态复位的定时器
  const copyIdRef = shallowRef<null | ReturnType<typeof setTimeout>>(null);

  const cleanCopyId = () => {
    if (!copyIdRef.value) {
      return;
    }

    clearTimeout(copyIdRef.value);
    copyIdRef.value = null;
  };

  /** 解析要复制的文本（支持函数/静态值/缺省取内容） */
  const getClipboardText = async () => {
    const config = unref(copyConfig);
    // 函数形式（可异步）
    if (typeof config?.text === 'function') {
      return config.text();
    }
    // 静态文本
    if (config?.text !== undefined) {
      return config.text;
    }
    // 缺省：从子节点提取纯文本并拼接
    const origin = getText?.();
    const textList = toList(origin, true).map((item) => {
      item = getTextByNode(item);
      if (typeof item === 'string' || typeof item === 'number') {
        return String(item);
      }
      return '';
    });
    return textList.join('');
  };

  // 卸载时清理定时器
  onBeforeUnmount(cleanCopyId);

  /** 点击复制主流程 */
  const onClick = async (e?: MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    copyLoading.value = true;
    try {
      const text = await getClipboardText();
      const config = unref(copyConfig);
      // 按配置指定剪贴板格式（默认纯文本）
      const copyOptions: { format?: 'text/html' | 'text/plain' } = {};
      if (config?.format) {
        copyOptions.format = config.format;
      }
      // oxlint-disable-next-line eqeqeq
      await copy(text == null ? '' : String(text), copyOptions);
      copyLoading.value = false;

      // 进入"已复制"态，3 秒后复位
      copied.value = true;

      // Trigger tips update
      // 触发 tooltip 文案更新
      cleanCopyId();
      copyIdRef.value = setTimeout(() => {
        copied.value = false;
      }, 3000);

      unref(copyConfig)?.onCopy?.(e);
    } catch (error) {
      copyLoading.value = false;
      throw error;
    }
  };

  return {
    copied,
    copyLoading,
    onClick,
  };
}

export default useCopyClick;
