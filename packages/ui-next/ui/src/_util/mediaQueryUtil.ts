type MQListenerHandler = (
  mql: MediaQueryList,
  handler: (e: MediaQueryListEvent) => void,
) => void;

export const addMediaQueryListener: MQListenerHandler = (mql, handler) => {
  // Don't delete here, please keep the code compatible
  if (mql?.addEventListener !== undefined) {
    mql.addEventListener('change', handler);
  } else if (mql?.addListener !== undefined) {
    mql.addListener(handler);
  }
};

export const removeMediaQueryListener: MQListenerHandler = (mql, handler) => {
  // Don't delete here, please keep the code compatible
  if (mql?.removeEventListener !== undefined) {
    mql.removeEventListener('change', handler);
  } else if (mql?.removeListener !== undefined) {
    mql.removeListener(handler);
  }
};
