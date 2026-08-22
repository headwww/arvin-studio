import type { PropType, VNodeRef } from 'vue';

import { defineComponent, nextTick, ref, shallowRef, toRef } from 'vue';

import findDOMNode from '../util/Dom/findDOMNode';
import { cloneElement } from '../util/vnode';
import useMutateObserver from './useMutateObserver';
import DomWrapper from './Wrapper';

type OnMutateFn = (
  mutations: MutationRecord[],
  observer: MutationObserver,
) => void;

export default defineComponent({
  name: 'VCMutateObserver',
  props: {
    onMutate: {
      type: Function as PropType<OnMutateFn>,
      default: () => {},
    },
    options: {
      type: Object as PropType<MutationObserverInit>,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const internalOptions = toRef(props, 'options');

    const elementRef = ref();

    const wrapperRef = ref();

    const target = shallowRef<Element | null | Text>(null);

    const callback: OnMutateFn = (...args) => props.onMutate(...args);

    const bindRef = (e: VNodeRef) => (elementRef.value = e);

    const getDom = () => {
      const dom =
        findDOMNode(elementRef as any) ||
        (elementRef.value && typeof elementRef.value === 'object'
          ? findDOMNode((elementRef.value as any).nativeElement)
          : null) ||
        (wrapperRef.value && findDOMNode(wrapperRef.value));

      if (dom && dom.nodeType === 3 && dom.nextElementSibling)
        return dom.nextElementSibling as HTMLElement;

      return dom;
    };

    useMutateObserver(target, callback, internalOptions);

    return () => {
      const children = slots?.default?.();
      if (!children) {
        return null;
      }

      nextTick(() => {
        target.value = getDom();
      });

      return (
        <DomWrapper ref={wrapperRef}>
          {cloneElement(children as any, { ref: bindRef }, true, true)}
        </DomWrapper>
      );
    };
  },
});
