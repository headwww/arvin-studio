import {
  browse as browseKit,
  isFunction,
  objectEach,
  remove,
  throttle,
} from '@arvin-studio/kit';

export type AsGlobalEventType =
  | 'blur'
  | 'click'
  | 'contextmenu'
  | 'copy'
  | 'cut'
  | 'keydown'
  | 'mousedown'
  | 'mousewheel'
  | 'paste'
  | 'resize'
  | 'scroll';

export type AsGlobalEventKey = {
  A: 'A';
  ARROW_DOWN: 'ArrowDown';
  ARROW_LEFT: 'ArrowLeft';
  ARROW_RIGHT: 'ArrowRight';
  ARROW_UP: 'ArrowUp';
  BACKSPACE: 'Backspace';
  C: 'C';
  CONTEXT_MENU: 'ContextMenu';
  D: 'D';
  DELETE: 'Delete';
  END: 'End';
  ENTER: 'Enter';
  ESCAPE: 'Escape';
  F: 'F';
  F2: 'F2';
  F10: 'F10';
  H: 'H';
  HOME: 'Home';
  M: 'M';
  P: 'P';
  PAGE_DOWN: 'PageDown';
  PAGE_UP: 'PageUp';
  PROCESS: 'Process';
  R: 'R';
  SPACEBAR: ' ';
  TAB: 'Tab';
  V: 'V';
  X: 'X';
  Y: 'Y';
  Z: 'Z';
};

export type AsGlobalCreateEventMethod = (
  evnt: Event | null,
  params1: any,
  params2?: any,
) => AsComponentEvent;

export interface AsGlobalEvents {
  hasKey(evnt: KeyboardEvent, targetKey: string): boolean;
  off(
    comp: {
      xID: string;
    },
    type: AsGlobalEventType,
  ): void;
  on(
    comp: {
      xID: string;
    },
    type: AsGlobalEventType,
    cb: (evnt: any) => void,
  ): void;
}

export const GLOBAL_EVENT_KEYS: AsGlobalEventKey = {
  F2: 'F2',
  F10: 'F10',
  TAB: 'Tab',
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  DELETE: 'Delete',
  BACKSPACE: 'Backspace',
  SPACEBAR: ' ',
  CONTEXT_MENU: 'ContextMenu',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
  HOME: 'Home',
  END: 'End',
  A: 'A',
  X: 'X',
  C: 'C',
  V: 'V',
  D: 'D',
  F: 'F',
  H: 'H',
  M: 'M',
  Y: 'Y',
  Z: 'Z',
  R: 'R',
  PROCESS: 'Process',
  P: 'P',
};

const browse = browseKit();

const convertEventKeys: { [key: string]: string } = {
  ' ': 'Spacebar',
  Apps: GLOBAL_EVENT_KEYS.CONTEXT_MENU,
  Del: GLOBAL_EVENT_KEYS.DELETE,
  Up: GLOBAL_EVENT_KEYS.ARROW_UP,
  Down: GLOBAL_EVENT_KEYS.ARROW_DOWN,
  Left: GLOBAL_EVENT_KEYS.ARROW_LEFT,
  Right: GLOBAL_EVENT_KEYS.ARROW_RIGHT,
};

// 监听全局事件
const wheelName = browse.firefox ? 'DOMMouseScroll' : 'mousewheel';
const eventStore: {
  cb: (evnt: Event) => void;
  comp: {
    xID: string;
  };
  type: string;
}[] = [];

function triggerEvent(evnt: Event) {
  const isWheel = evnt.type === wheelName;
  eventStore.forEach(({ type, cb }) => {
    // 如果被取消冒泡，不再执行
    if (
      !evnt.cancelBubble &&
      (type === evnt.type || (isWheel && type === 'mousewheel'))
    ) {
      cb(evnt);
    }
  });
}

class AsComponentEvent {
  $event: Event;
  code = '';
  key = '';
  type = '';
  constructor(evnt: Event, params1: any, params2?: any) {
    this.$event = evnt;
    if (evnt) {
      if ((evnt as KeyboardEvent).type) {
        this.type = (evnt as KeyboardEvent).type;
      }
      if ((evnt as KeyboardEvent).key) {
        this.key = (evnt as KeyboardEvent).key;
      }
      if ((evnt as KeyboardEvent).code) {
        this.code = (evnt as KeyboardEvent).code;
      }
    }
    Object.assign(this, params1);
    objectEach(params2, (val, key) => {
      if (isFunction(val)) {
        let rest: any = null;
        let isRun = false;
        Object.defineProperty(this, key, {
          get() {
            if (!isRun) {
              isRun = true;
              rest = val();
            }
            return rest;
          },
        });
      } else {
        (this as any)[key] = val;
      }
    });
  }

  preventDefault() {
    const evnt = this.$event;
    if (evnt) {
      evnt.preventDefault();
    }
  }

  stopPropagation() {
    const evnt = this.$event;
    if (evnt) {
      evnt.stopPropagation();
    }
  }
}

export const createEvent: AsGlobalCreateEventMethod = (
  evnt,
  params1,
  params2,
) => {
  if (evnt instanceof AsComponentEvent) {
    evnt = evnt.$event;
  }
  return new AsComponentEvent(evnt as Event, params1, params2);
};

export const globalEvents: AsGlobalEvents = {
  on(comp, type, cb) {
    eventStore.push({ comp, type, cb });
  },
  off(comp, type) {
    remove(eventStore, (item) => item.comp === comp && item.type === type);
  },
  hasKey(evnt, targetKey) {
    if (!targetKey) {
      return false;
    }
    const { key } = evnt;
    targetKey = targetKey.toLowerCase();
    return key
      ? targetKey === key.toLowerCase() ||
          !!(
            convertEventKeys[key] &&
            convertEventKeys[key].toLowerCase() === targetKey
          )
      : false;
  },
};

if (browse.isDoc) {
  if (!browse.msie) {
    window.addEventListener('copy', triggerEvent, { capture: false });
    window.addEventListener('cut', triggerEvent, { capture: false });
    window.addEventListener('paste', triggerEvent, { capture: false });
  }
  document.addEventListener('scroll', triggerEvent, { capture: true });
  document.addEventListener('keydown', triggerEvent, { capture: false });
  document.addEventListener('contextmenu', triggerEvent, { capture: false });
  window.addEventListener('mousedown', triggerEvent, { capture: false });
  window.addEventListener('click', triggerEvent, { capture: false });
  window.addEventListener('blur', triggerEvent, { capture: false });
  window.addEventListener('resize', triggerEvent, { capture: false });
  window.addEventListener(
    wheelName,
    throttle(triggerEvent, 100, { leading: true, trailing: false }),
    { passive: true, capture: false },
  );
}
