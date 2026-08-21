import type { Ref } from 'vue';

import { shallowRef, watch } from 'vue';

import { raf } from '../../util';
import KeyCode from '../../util/KeyCode';

const { ESC, TAB } = KeyCode;

interface UseAccessibilityProps {
  autoFocus?: Ref<boolean>;
  onVisibleChange?: (visible: boolean) => void;
  overlayRef?: Ref<any>;
  triggerRef: Ref<any>;
  visible: Ref<boolean>;
}

export default function useAccessibility({
  visible,
  triggerRef,
  onVisibleChange,
  autoFocus,
  overlayRef,
}: UseAccessibilityProps) {
  const focusMenuRef = shallowRef(false);
  const handleCloseMenuAndReturnFocus = () => {
    if (!visible.value) {
      return;
    }

    triggerRef.value?.focus?.();
    onVisibleChange?.(false);
  };

  const focusMenu = () => {
    if (overlayRef?.value?.focus) {
      overlayRef.value.focus();
      focusMenuRef.value = true;
      return true;
    }
    return false;
  };

  const handleKeyDown = (event: any) => {
    switch (event.keyCode) {
      case ESC: {
        handleCloseMenuAndReturnFocus();
        break;
      }
      case TAB: {
        const focusResult: boolean = focusMenuRef.value ? false : focusMenu();

        if (focusResult) {
          event.preventDefault();
        } else {
          handleCloseMenuAndReturnFocus();
        }
        break;
      }
    }
  };
  watch(visible, (_n, _o, onCleanup) => {
    if (visible.value) {
      window.addEventListener('keydown', handleKeyDown);
      if (autoFocus) {
        // FIXME: hack with raf
        raf(focusMenu, 3);
      }
      onCleanup(() => {
        window.removeEventListener('keydown', handleKeyDown);
        focusMenuRef.value = false;
      });
    } else {
      onCleanup(() => {
        focusMenuRef.value = false;
      });
    }
  });
}
