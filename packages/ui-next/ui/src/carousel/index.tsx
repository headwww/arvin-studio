import type { App, ButtonHTMLAttributes, CSSProperties, SlotsType } from 'vue';

import type { SlickProps as Settings } from '@arvin-studio/headless';

import type { VueNode } from '../_util';
import type { ComponentBaseProps } from '../config-provider/context';

import { computed, defineComponent, shallowRef, watch } from 'vue';

import { filterEmpty, Slick } from '@arvin-studio/headless';
import { clsx, omit } from '@arvin-studio/kit';

import { getAttrStyleAndClass } from '../_util/hooks';
import { getSlotPropsFnRun } from '../_util/tools';
import { useComponentBaseConfig } from '../config-provider/context';
import useStyle, { DotDuration } from './style';

export type CarouselEffect = 'fade' | 'scrollx';
export type DotPlacement = 'bottom' | 'end' | 'start' | 'top';
export interface CarouselProps
  extends
    CarouselEmitsProps,
    ComponentBaseProps,
    Omit<
      Settings,
      | 'autoplay'
      | 'className'
      | 'dots'
      | 'dotsClass'
      | 'nextArrow'
      | 'onEdge'
      | 'onInit'
      | 'onLazyLoad'
      | 'onLazyLoadError'
      | 'onReInit'
      | 'onSwipe'
      | 'prevArrow'
      | 'style'
    > {
  arrows?: boolean;
  autoplay?: boolean | { dotDuration?: boolean };
  autoplaySpeed?: number;
  dotPlacement?: DotPlacement;
  dots?: boolean | { class?: string };
  draggable?: boolean;
  effect?: CarouselEffect;
  id?: string;
  initialSlide?: number;
  nextArrow?: VueNode;
  prevArrow?: VueNode;
  slickGoTo?: number;
  waitForAnimate?: boolean;
}

export interface CarouselSlots {
  default: () => any;
  nextArrow: () => any;
  prevArrow: () => any;
}

export interface CarouselEmits {
  edge: NonNullable<Settings['onEdge']>;
  init: NonNullable<Settings['onInit']>;
  lazyLoad: NonNullable<Settings['onLazyLoad']>;
  lazyLoadError: NonNullable<Settings['onLazyLoadError']>;
  reInit: NonNullable<Settings['onReInit']>;
  swipe: NonNullable<Settings['onSwipe']>;
}
export interface CarouselEmitsProps {
  onEdge?: CarouselEmits['edge'];
  onInit?: CarouselEmits['init'];
  onLazyLoad?: CarouselEmits['lazyLoad'];
  onLazyLoadError?: CarouselEmits['lazyLoadError'];
  onReInit?: CarouselEmits['reInit'];
  onSwipe?: CarouselEmits['swipe'];
}

export interface CarouselRef {
  autoPlay: (playType?: 'blur' | 'leave' | 'update') => void;
  goTo: (slide: number, dontAnimate?: boolean) => void;
  innerSlider: any;
  next: () => void;
  prev: () => void;
}

const omitKeys = [
  'dots',
  'arrows',
  'prevArrow',
  'nextArrow',
  'draggable',
  'waitForAnimate',
  'dotPosition',
  'dotPlacement',
  'vertical',
  'rootClass',
  'id',
  'autoplay',
  'autoplaySpeed',
  'rtl',
];

const dotsClass = 'slick-dots';

interface ArrowType extends /** @vue-ignore */ ButtonHTMLAttributes {
  currentSlide?: number;
  slideCount?: number;
}

const ArrowButton = defineComponent<ArrowType>(
  (_, { slots, attrs }) => {
    return () => {
      return (
        <button type="button" {...attrs}>
          {slots?.default?.()}
        </button>
      );
    };
  },
  {
    name: 'ArrowButton',
    inheritAttrs: false,
  },
);

const defaults = {
  dots: true,
  arrows: false,
  draggable: false,
  waitForAnimate: false,
  autoplay: false,
  autoplaySpeed: 3000,
  initialSlide: 0,
} as any;

const Carousel = defineComponent<
  CarouselProps,
  CarouselEmits,
  string,
  SlotsType<CarouselSlots>
>(
  (props = defaults, { slots, emit, expose, attrs }) => {
    const mergedDotPlacement = computed(() => {
      const { dotPlacement } = props;
      const placement: 'left' | 'right' | DotPlacement =
        dotPlacement ?? 'bottom';
      return placement;
    });
    const mergedVertical = computed(
      () =>
        props?.vertical ??
        (mergedDotPlacement.value === 'start' ||
          mergedDotPlacement.value === 'end'),
    );
    const {
      prefixCls,
      direction,
      class: contextClassName,
      style: contextStyle,
    } = useComponentBaseConfig('carousel', props);
    const slickRef = shallowRef();

    const goTo = (slide: number, dontAnimate = false) => {
      slickRef.value?.slickGoTo?.(slide, dontAnimate);
    };
    expose({
      goTo,
      autoPlay: (playType) =>
        slickRef?.value?.innerSlider?.autoPlay?.(playType),
      next: () => slickRef?.value?.innerSlider?.slickNext?.(),
      prev: () => slickRef?.value?.innerSlider?.slickPrev?.(),
      innerSlider: computed(() => slickRef.value?.innerSlider),
    } as CarouselRef);

    const count = shallowRef(0);
    const isRTL = computed(
      () => (props?.rtl ?? direction.value === 'rtl') && !props.vertical,
    );

    watch(
      [count, () => props?.initialSlide, isRTL],
      () => {
        const { initialSlide = 0 } = props;
        if (count.value > 0) {
          const newIndex = isRTL.value
            ? count.value - initialSlide - 1
            : initialSlide;
          goTo(newIndex, false);
        }
      },
      {
        immediate: true,
      },
    );

    const [hashId, cssVarCls] = useStyle(prefixCls);

    const onAttrs: Partial<Settings> = {
      onSwipe(...args) {
        emit('swipe', ...args);
      },
      onInit() {
        emit('init');
      },
      onEdge(...args) {
        emit('edge', ...args);
      },
      onReInit() {
        emit('reInit');
      },
      onLazyLoad(...args) {
        emit('lazyLoad', ...args);
      },
      onLazyLoadError() {
        emit('lazyLoadError');
      },
    };
    return () => {
      const {
        dots,
        rootClass,
        autoplay,
        autoplaySpeed,
        id,
        arrows,
        draggable,
        waitForAnimate,
      } = props;
      const otherProps = omit(props, omitKeys);
      const enableDots = !!dots;
      const dsClass = clsx(
        dotsClass,
        `${dotsClass}-${mergedDotPlacement.value}`,
        typeof dots === 'boolean' ? false : dots?.class,
      );
      const {
        className: customClassName,
        style,
        restAttrs,
      } = getAttrStyleAndClass(attrs);
      const newProps: Record<string, any> = {
        vertical: mergedVertical.value,
        className: clsx(customClassName, contextClassName.value),
        style: { ...contextStyle.value, ...style },
        autoplay: !!autoplay,
        ...otherProps,
      };

      if (newProps.effect === 'fade') {
        newProps.fade = true;
      }
      const className = clsx(
        prefixCls.value,
        {
          [`${prefixCls.value}-rtl`]: isRTL.value,
          [`${prefixCls.value}-vertical`]: newProps.vertical,
        },
        hashId.value,
        cssVarCls.value,
        rootClass,
      );

      const mergedShowDuration =
        autoplay &&
        (typeof autoplay === 'object' ? autoplay.dotDuration : false);

      const dotDurationStyle: CSSProperties = mergedShowDuration
        ? { [DotDuration]: `${autoplaySpeed}ms` }
        : {};
      const children = slots?.default?.();
      const childNodes = filterEmpty(children || []).filter(Boolean);
      if (count.value !== childNodes.length) {
        count.value = childNodes.length;
      }

      const prevArrow = getSlotPropsFnRun(slots, props, 'prevArrow');
      const nextArrow = getSlotPropsFnRun(slots, props, 'nextArrow');
      return (
        <div {...restAttrs} class={className} id={id} style={dotDurationStyle}>
          <Slick
            ref={slickRef}
            {...onAttrs}
            {...(newProps as any)}
            arrows={arrows}
            autoplaySpeed={autoplaySpeed}
            dots={enableDots}
            dotsClass={dsClass}
            draggable={draggable}
            nextArrow={
              nextArrow ?? (
                <ArrowButton aria-label={isRTL.value ? 'prev' : 'next'} />
              )
            }
            prevArrow={
              prevArrow ?? (
                <ArrowButton aria-label={isRTL.value ? 'next' : 'prev'} />
              )
            }
            rtl={isRTL.value}
            verticalSwiping={mergedVertical.value}
            waitForAnimate={waitForAnimate}
          >
            {children}
          </Slick>
        </div>
      );
    };
  },
  {
    name: 'AsCarousel',
    inheritAttrs: false,
  },
);
(Carousel as any).install = (app: App) => {
  app.component(Carousel.name, Carousel);
};

export default Carousel;
