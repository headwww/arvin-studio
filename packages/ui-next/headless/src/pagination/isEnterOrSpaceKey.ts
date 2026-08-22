import KeyCode from '../util/KeyCode';

interface KeyboardEventLike {
  charCode?: number;
  key?: string;
  keyCode?: number;
}

export default function isEnterOrSpaceKey(event: KeyboardEventLike) {
  return (
    event.key === 'Enter' ||
    event.key === ' ' ||
    event.key === 'Spacebar' ||
    event.charCode === KeyCode.ENTER ||
    event.keyCode === KeyCode.ENTER
  );
}
