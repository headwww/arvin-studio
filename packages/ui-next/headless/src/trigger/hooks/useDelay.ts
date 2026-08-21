import { onBeforeUnmount, ref } from 'vue';

export default function useDelay() {
  const delayRef = ref<null | ReturnType<typeof setTimeout>>(null);
  const clearDelay = () => {
    if (!delayRef.value) {
      return;
    }

    clearTimeout(delayRef.value);
    delayRef.value = null;
  };

  const delayInvoke = (callback: VoidFunction, delay: number) => {
    clearDelay();

    if (delay === 0) {
      callback();
    } else {
      delayRef.value = setTimeout(() => {
        callback();
      }, delay * 1000);
    }
  };

  onBeforeUnmount(() => {
    clearDelay();
  });
  return delayInvoke;
}
