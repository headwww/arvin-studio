import type { InjectionKey, Ref } from 'vue';

import { getCurrentInstance, inject, provide, ref } from 'vue';

import useLocale from '../locale/useLocale';
import version from '../version';
import { defaultLogMessages } from './loggerMessages';
import { isDev, noop } from './warning';

export type LogKey = string;
export type LogArgs = any[];

/** 'silent' 全静默；'error' 只保留 error 级别 */
export type LogLevel = 'error' | 'silent' | 'warn';

export interface LoggingContextProps {
  /**
   * 输出等级，默认输出全部
   */
  level?: LogLevel;
  /**
   * 消息目录覆盖（优先级最高，可用于替换文案或加团队前缀）
   */
  messages?: Record<string, string>;
  /**
   * @default true
   */
  once?: boolean;
}

export interface Logger {
  deprecated: (
    valid: boolean,
    oldProp: string,
    newProp: string,
    extra?: string,
  ) => void;
  error: (key: LogKey, args?: LogArgs) => void;
  warn: (key: LogKey, args?: LogArgs) => void;
}

const LoggerContextKey: InjectionKey<Ref<LoggingContextProps>> =
  Symbol('LoggerContext');

export function useLoggerProvider(props: Ref<LoggingContextProps>) {
  provide(LoggerContextKey, props);
}

export function useLoggerContext(): Ref<LoggingContextProps> {
  const instance = getCurrentInstance();
  if (!instance) {
    return ref<LoggingContextProps>({});
  }
  return inject(LoggerContextKey, ref<LoggingContextProps>({}));
}

/**
 * `{0}` `{1}` 位置占位符插值
 * 与 vxe 中 getI18n 内部使用的 XEUtils.toFormatString 行为一致
 */
export function formatMessage(template: string, args?: LogArgs): string {
  if (!args || args.length === 0) {
    return template;
  }
  return template.replaceAll(
    /\{(\d+)\}/g,
    (_, index) => `${args[Number(index)] ?? ''}`,
  );
}

const warnedKeys = new Set<string>();

/** 清空去重表（测试或需要重新提示时使用） */
export function resetWarnedLogs() {
  warnedKeys.clear();
}

const noopLogger: Logger = {
  warn: noop,
  error: noop,
  deprecated: noop,
};

/**
 * 创建组件级日志器（仅开发环境生效）
 *
 * 与 `devUseWarning` 一致，需要在 setup / computed 内调用（内部使用 inject）。
 *
 * @example
 * const logger = useLog('Table')
 * logger.error('errConflicts', ['tree-config.showLine', 'column.type=expand'])
 * // → [antd: Table@0.2.1] Parameter "tree-config.showLine" conflicts with "column.type=expand"
 */
export function useLog(component: string): Logger {
  if (!isDev) {
    return noopLogger;
  }

  // 复用 antd 的 locale 合并：内置英文目录 + 语言包 / ConfigProvider 的逐字段覆盖
  const [loggerLocale] = useLocale('Logger', defaultLogMessages);
  const loggingCtx = useLoggerContext();

  const resolveMessage = (key: LogKey, args?: LogArgs) => {
    const { messages } = loggingCtx.value;
    // 优先级：ConfigProvider.messages > 语言包 Logger > 内置英文目录 > key 原文
    const template = messages?.[key] || loggerLocale?.value?.[key] || key;
    return formatMessage(template, args);
  };

  const emit = (level: 'error' | 'warn', key: LogKey, args?: LogArgs) => {
    const { level: currentLevel, once = true } = loggingCtx.value;
    if (currentLevel === 'silent') {
      return;
    }
    if (level === 'warn' && currentLevel === 'error') {
      return;
    }

    const message = `[arvin-studio: ${component}@${version}] ${resolveMessage(key, args)}`;
    if (once) {
      if (warnedKeys.has(message)) {
        return;
      }
      warnedKeys.add(message);
    }

    if (level === 'error') {
      console.error(message);
    } else {
      console.warn(message);
    }
  };

  return {
    warn: (key, args) => emit('warn', key, args),
    error: (key, args) => emit('error', key, args),
    deprecated: (valid, oldProp, newProp, extra) => {
      if (valid) {
        return;
      }
      emit('warn', 'deprecated', [
        `\`${oldProp}\``,
        `\`${newProp}\``,
        extra ? ` ${extra}` : '',
      ]);
    },
  };
}

export default useLog;
