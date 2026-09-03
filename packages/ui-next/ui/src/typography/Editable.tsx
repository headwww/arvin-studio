/**
 * Typography.Editable（行内编辑文本域）
 *
 * 编辑态的 UI 实现：把内容切换为一个 TextArea + 回车确认图标。
 * - 回车（Enter）确认保存，Esc 取消，失焦确认保存；
 * - 输入法组合期间（composition）不触发按键提交；
 * - 值变化时实时同步父级（通过 onSave 在确认时提交）；
 * - 自动聚焦并把光标移到末尾；autoSize 自适应高度。
 */
import type { CSSProperties, SlotsType } from 'vue';

import type { EmptyEmit, VueNode } from '../_util';
import type { DirectionType } from '../config-provider/context';
import type { TextAreaRef } from '../input';
import type {
  TypographySemanticClassNames,
  TypographySemanticStyles,
} from './interface';

import { defineComponent, onMounted, shallowRef, watch } from 'vue';

import { KeyCode } from '@arvin-studio/headless';
import { EnterOutlined } from '@arvin-studio/icons';
import { clsx } from '@arvin-studio/kit';

import { toPropsRefs } from '../_util/tools';
import { cloneElement } from '../_util/vueNode';
import TextArea from '../input/TextArea';
import useStyle from './style';

export interface EditableProps {
  'aria-label'?: string;
  /** 自适应高度 */
  autoSize?: any;
  /**
   * Semantic class names. `root` applies to the wrapper div, `textarea`
   * applies to the TextArea. Mirrors ant-design 6.4 Editable.
   */
  /** 语义化类名：root 作用于外层 div，textarea 作用于 TextArea */
  classes?: TypographySemanticClassNames;
  className?: string;
  /** 所属组件类型（拼类名用，如 link/paragraph） */
  component?: string;
  direction?: DirectionType;
  /** 回车确认图标 */
  enterIcon?: VueNode;
  /** 输入最大长度 */
  maxLength?: number;
  /** 取消编辑（Esc） */
  onCancel: () => void;
  /** 编辑结束（确认或取消后） */
  onEnd?: () => void;
  /** 确认保存（回车/失焦） */
  onSave: (value: string) => void;
  prefixCls: string;
  style?: CSSProperties;
  /** 语义化样式 */
  styles?: TypographySemanticStyles;
  /** 当前编辑文本 */
  value: string;
}

/** 默认 props：autoSize 默认开启 */
const defaults = {
  autoSize: true,
} as any;
const Editable = defineComponent<
  EditableProps,
  EmptyEmit,
  string,
  SlotsType<Record<string, never>>
>(
  (props = defaults) => {
    const { prefixCls, direction, maxLength, autoSize } = toPropsRefs(
      props,
      'prefixCls',
      'direction',
      'maxLength',
      'autoSize',
    );

    // TextArea 组件实例（拿到内部原生 textarea）
    const ref = shallowRef<TextAreaRef>();

    // 输入法组合状态与上一次按键
    const inComposition = shallowRef(false);
    const lastKeyCode = shallowRef<null | number>(null);

    // 本地编辑值（以 props.value 为初始，随 props 同步）
    const current = shallowRef(props.value);

    watch(
      () => props.value,
      (val) => {
        current.value = val;
      },
    );

    // 挂载后自动聚焦并把光标移到末尾
    onMounted(() => {
      if (!ref.value?.resizableTextArea) {
        return;
      }

      const { textArea } = ref.value.resizableTextArea;
      textArea.focus();
      const { length } = textArea.value;
      textArea.setSelectionRange(length, length);
    });

    // 输入变化：剔除换行（单行编辑语义）
    const onChange: any = ({ target }: any) => {
      current.value = target.value.replaceAll(/[\n\r]/g, '');
    };

    const onCompositionStart = () => {
      inComposition.value = true;
    };

    const onCompositionEnd = () => {
      inComposition.value = false;
    };

    // 记录按键（组合输入期间不记录，避免误判 Enter/Esc）
    // eslint-disable-next-line unicorn/prefer-keyboard-event-key
    const onKeyDown: any = ({ keyCode }: KeyboardEvent) => {
      if (inComposition.value) {
        return;
      }
      lastKeyCode.value = keyCode;
    };

    /** 确认保存：trim 后回调 onSave */
    const confirmChange = () => {
      props?.onSave?.(current.value.trim());
    };

    // 按键弹起：Enter 确认 + onEnd；Esc 取消
    // 需与 keydown 记录的键一致、非组合态、无修饰键
    const onKeyUp: any = ({
      // eslint-disable-next-line unicorn/prefer-keyboard-event-key
      keyCode,
      ctrlKey,
      altKey,
      metaKey,
      shiftKey,
    }: KeyboardEvent) => {
      if (
        lastKeyCode.value !== keyCode ||
        inComposition.value ||
        ctrlKey ||
        altKey ||
        metaKey ||
        shiftKey
      ) {
        return;
      }
      if (keyCode === KeyCode.ENTER) {
        confirmChange();
        props?.onEnd?.();
      } else if (keyCode === KeyCode.ESC) {
        props?.onCancel?.();
      }
    };

    // 失焦也确认保存
    const onBlur: any = () => {
      confirmChange();
    };

    // 注册样式（编辑内容区域的样式在 style 中）
    const [hashId, cssVarCls] = useStyle(prefixCls);

    // 回车确认图标（可自定义）
    const icon =
      props.enterIcon === undefined ? <EnterOutlined /> : props.enterIcon;

    return () => {
      const { component, className } = props;
      const classes = props.classes ?? {};
      const styles = props.styles ?? {};
      const textAreaClassName = clsx(
        prefixCls.value,
        `${prefixCls.value}-edit-content`,
        {
          [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
          [`${prefixCls.value}-${component}`]: !!component,
        },
        className,
        classes.root,
        hashId.value,
        cssVarCls.value,
      );
      return (
        <div
          class={textAreaClassName}
          style={{ ...styles.root, ...props.style }}
        >
          <TextArea
            aria-label={props['aria-label']}
            autoSize={autoSize.value}
            class={classes.textarea}
            maxlength={maxLength.value}
            onBlur={onBlur}
            onChange={onChange}
            onCompositionend={onCompositionEnd}
            onCompositionstart={onCompositionStart}
            onKeydown={onKeyDown}
            onKeyup={onKeyUp}
            ref={ref}
            rows={1}
            style={styles.textarea}
            value={current.value}
          />
          {/* 回车确认图标（视觉提示，不拦截点击——保存由按键/失焦触发） */}
          {icon === null
            ? null
            : cloneElement(icon as any, {
                class: `${prefixCls.value}-edit-content-confirm`,
              })}
        </div>
      );
    };
  },
  {
    name: 'TypographyEditable',
    inheritAttrs: false,
  },
);

export default Editable;
