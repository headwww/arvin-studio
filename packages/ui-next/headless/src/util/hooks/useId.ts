/**
 * @v-c/util ID 生成工具（hooks/useId）
 *
 * 包装 Vue 内置 useId，提供 SSR 安全的稳定 ID：
 * - 显式传入 id 时直接返回（完全受控，交给调用方）；
 * - 测试环境统一返回 'test-id'（保证快照稳定可复现）；
 * - 其余情况返回 Vue 的 useId（服务端/客户端渲染保持一致）。
 * 另有 getId：把 prefix + key 拼接成合法 HTML id（非法字符替换为 -）。
 */
import { useId } from 'vue';

/* 间接获取 Vue 的 useId 引用（保持模块顶层无副作用解构） */
function getUseId() {
  return useId;
}

const useOriginalId = getUseId();

/**
 * 生成稳定 ID
 * @param id 显式指定的 ID；非空时直接返回，不做任何处理
 * @returns 显式 id / 'test-id'（测试环境）/ Vue useId 生成的稳定 id
 */
export default function useId_(id?: string) {
  const vueId = useOriginalId();
  if (id) {
    return id;
  }

  return vueId;
}

/**
 * Generate a valid HTML id from prefix and key.
 * Sanitizes the key by replacing invalid characters with hyphens.
 * 由 prefix 与 key 生成合法 HTML id：把 key 中的非法字符替换为连字符
 * @param prefix - The prefix for the id
 * @param key - The element key, may contain spaces or invalid characters
 * @returns A valid HTML id string
 */
export function getId(prefix: string, key: number | string): string {
  const keyStr = String(key);

  // Valid id characters: letters, digits, hyphen, underscore, colon, period
  // Replace all invalid characters (including spaces) with hyphens to preserve length
  /* HTML id 合法字符：字母、数字、连字符、下划线、冒号、句点；
   * 其余字符（含空格）替换为连字符，以保持字符串长度不变 */
  const sanitizedKey = keyStr.replaceAll(/[^a-zA-Z0-9_.:-]/g, '-');

  return `${prefix}-${sanitizedKey}`;
}
