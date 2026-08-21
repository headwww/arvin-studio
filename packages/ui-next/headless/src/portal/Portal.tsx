import {
  computed,
  createVNode,
  defineComponent,
  isVNode,
  onMounted,
  shallowRef,
  Teleport,
  watch,
} from 'vue';

import { canUseDom, filterEmpty, getDOM, warning } from '../util';
import { useContextProvider } from './Context';
import useDom from './useDom';
import useEscKeyDown from './useEscKeyDown';
import useScrollLocker from './useScrollLocker';

export type ContainerType = DocumentFragment | Element;

export type GetContainer =
  | (() => ContainerType)
  | ContainerType
  | false
  | string;
export type EscCallback = ({
  top,
  event,
}: {
  event: KeyboardEvent;
  top: boolean;
}) => void;
export interface PortalProps {
  /** Remove `children` when `open` is `false`. Set `false` will not handle remove process */
  autoDestroy?: boolean;
  /** Lock screen scroll when open */
  autoLock?: boolean;
  /** @private debug name. Do not use in prod */
  debug?: string;
  /** Customize container element. Default will create a div in document.body when `open` */
  getContainer?: GetContainer;
  onEsc?: EscCallback;

  // children?: React.ReactNode
  /** Show the portal children */
  open?: boolean;
}

function getPortalContainer(getContainer: GetContainer) {
  if (getContainer === false) return false;

  if (!canUseDom() || !getContainer) return null;

  if (typeof getContainer === 'string')
    return document.querySelector(getContainer);

  if (typeof getContainer === 'function')
    return getDOM(getContainer()) as ContainerType;

  return (
    typeof getContainer === 'object' ? getDOM(getContainer) : getContainer
  ) as ContainerType;
}

const defaults = {
  autoDestroy: true,
  getContainer: undefined,
};

const Portal = defineComponent<PortalProps>(
  (props = defaults, { slots, expose }) => {
    const shouldRender = shallowRef(props.open);
    const mergedRender = computed(() => shouldRender.value || props.open);
    // ========================= Warning =========================
    // @ts-expect-error this is a global variable which injected by babel plugin
    // eslint-disable-next-line n/prefer-global/process
    if (process.env.NODE_ENV !== 'production') {
      warning(
        canUseDom() || !props.open,
        `Portal only work in client side. Please call 'useEffect' to show Portal instead default render in SSR.`,
      );
    }
    // ====================== Should Render ======================
    watch([() => props.open, () => props.autoDestroy], () => {
      if (props.autoDestroy || props.open) shouldRender.value = props.open;
    });

    // ======================== Container ========================
    const innerContainer = shallowRef<ContainerType | false | null>(
      getPortalContainer(props.getContainer!),
    );
    onMounted(() => {
      const customizeContainer = getPortalContainer(props.getContainer!);
      // Tell component that we check this in effect which is safe to be `null`
      innerContainer.value = customizeContainer ?? null;
    });

    watch(
      () => props.getContainer,
      () => {
        const customizeContainer = getPortalContainer(props.getContainer!);
        // Tell component that we check this in effect which is safe to be `null`
        innerContainer.value = customizeContainer ?? null;
      },
    );

    const [defaultContainer, queueCreate] = useDom(
      computed(() => !!(mergedRender.value && !innerContainer.value)),
      props.debug,
    );

    useContextProvider(queueCreate);

    const mergedContainer = computed(
      () => innerContainer.value ?? defaultContainer,
    );

    // ========================= Locker ==========================
    useScrollLocker(
      computed(
        () =>
          !!(
            props.autoLock &&
            props.open &&
            canUseDom() &&
            (mergedContainer.value === defaultContainer ||
              mergedContainer.value === document.body)
          ),
      ),
    );

    // ========================= Esc Keydown ==========================
    useEscKeyDown(
      computed(() => !!props.open),
      (...args) => {
        props.onEsc?.(...args);
      },
    );

    const elementEl = shallowRef();
    const setRef = (el: any) => {
      elementEl.value = el;
    };
    expose({
      elementEl,
    });

    return () => {
      // ========================= Render ==========================
      // Do not render when nothing need render
      // When innerContainer is `undefined`, it may not ready since user use ref in the same render
      if (
        !mergedRender.value ||
        !canUseDom() ||
        innerContainer.value === undefined
      )
        return null;
      // Render inline
      const renderInline = mergedContainer.value === false;

      const reffedChildren = filterEmpty((slots as any).default?.() ?? []);
      if (renderInline) {
        return reffedChildren;
      } else {
        const child =
          reffedChildren.length === 1
            ? isVNode(reffedChildren[0])
              ? createVNode(reffedChildren[0], {
                  ref: setRef,
                })
              : reffedChildren[0]
            : reffedChildren;
        return <Teleport to={mergedContainer.value}>{child}</Teleport>;
      }
    };
  },
  {
    name: 'Portal',
    inheritAttrs: false,
  },
);

export default Portal;
