import KeyCode from '../../util/KeyCode';

/** keyCode Judgment function */
export function isValidateOpenKey(currentKeyCode: number): boolean {
  return (
    // Undefined for Edge bug:
    // https://github.com/ant-design/ant-design/issues/51292
    !!currentKeyCode &&
    // Other keys
    ![
      KeyCode.ALT,
      KeyCode.BACKSPACE,
      KeyCode.CAPS_LOCK,
      KeyCode.CONTEXT_MENU,
      KeyCode.CTRL,
      KeyCode.EQUALS,
      // System function button
      KeyCode.ESC,
      // F1-F12
      KeyCode.F1,
      KeyCode.F2,
      KeyCode.F3,
      KeyCode.F4,
      KeyCode.F5,
      KeyCode.F6,
      KeyCode.F7,
      KeyCode.F8,
      KeyCode.F9,
      KeyCode.F10,
      KeyCode.F11,
      KeyCode.F12,
      // KeyCode.DOWN,
      KeyCode.LEFT,
      KeyCode.META,
      KeyCode.RIGHT,
      KeyCode.SEMICOLON,
      KeyCode.SHIFT,
      KeyCode.TAB,
      // Arrow keys - should not trigger open when navigating in input
      KeyCode.UP,
      KeyCode.WIN_KEY,
      KeyCode.WIN_KEY_RIGHT,
    ].includes(currentKeyCode)
  );
}
