import type { CSSProperties, Ref, VNodeChild } from 'vue';

export type LazyLoadType = 'ondemand' | 'progressive' | boolean | null;

export interface SlickProps {
  accessibility?: boolean;
  adaptiveHeight?: boolean;
  afterChange?: ((currentSlide: number) => void) | null;
  appendDots?: (dots: VNodeChild[]) => VNodeChild;
  arrows?: boolean;
  asNavFor?: InnerSliderRef | null | SlickRef;
  autoplay?: boolean;
  autoplaySpeed?: number;
  beforeChange?: ((currentSlide: number, nextSlide: number) => void) | null;
  centerMode?: boolean;
  centerPadding?: string;
  className?: string;
  cssEase?: string;
  customPaging?: (index: number) => VNodeChild;
  dots?: boolean;
  dotsClass?: string;
  draggable?: boolean;
  easing?: string;
  edgeFriction?: number;
  fade?: boolean;
  focusOnSelect?: boolean;
  infinite?: boolean;
  initialSlide?: number;
  lazyLoad?: LazyLoadType;
  nextArrow?: VNodeChild;
  onEdge?: ((direction: string) => void) | null;
  onInit?: (() => void) | null;
  onLazyLoad?: ((slidesToLoad: number[]) => void) | null;
  onLazyLoadError?: (() => void) | null;
  onReInit?: (() => void) | null;
  onSwipe?: ((direction: string) => void) | null;
  pauseOnDotsHover?: boolean;
  pauseOnFocus?: boolean;
  pauseOnHover?: boolean;
  prevArrow?: VNodeChild;
  responsive?: null | ResponsiveSetting[];
  rows?: number;
  rtl?: boolean;
  slide?: string;
  slidesPerRow?: number;
  slidesToScroll?: number;
  slidesToShow?: number;
  speed?: number;
  style?: CSSProperties;
  swipe?: boolean;
  swipeEvent?: ((direction: string) => void) | null;
  swipeToSlide?: boolean;
  touchMove?: boolean;
  touchThreshold?: number;
  unslick?: boolean;
  useCSS?: boolean;
  useTransform?: boolean;
  variableWidth?: boolean;
  vertical?: boolean;
  verticalSwiping?: boolean;
  waitForAnimate?: boolean;
}

export type SlickSettings = Omit<SlickProps, 'responsive'>;

export interface ResponsiveSetting {
  breakpoint: number;
  settings: 'unslick' | SlickSettings;
}

export type AutoPlayType = 'blur' | 'leave' | 'play' | 'playing' | 'update';
export type PauseType = 'focused' | 'hovered' | 'paused';

export interface SlickRef {
  innerSlider?: InnerSliderRef | null | Ref<InnerSliderRef | null>;
  slickGoTo: (slide: number, dontAnimate?: boolean) => void;
  slickNext: () => void;
  slickPause: () => void;
  slickPlay: () => void;
  slickPrev: () => void;
}

export interface InnerSliderState {
  animating: boolean;
  autoplaying: 'focused' | 'hovered' | 'paused' | 'playing' | null;
  currentDirection: number;
  currentLeft: null | number;
  currentSlide: number;
  direction: number;
  dragging: boolean;
  edgeDragged: boolean;
  initialized: boolean;
  lazyLoadedList: number[];
  listHeight: null | number;
  listWidth: null | number;
  scrolling: boolean;
  slideCount: number;
  slideHeight: null | number;
  slideWidth: null | number | string;
  swiped: boolean;
  swipeLeft: null | number;
  swiping: boolean;
  targetSlide: number;
  touchObject: {
    curX: number;
    curY: number;
    startX: number;
    startY: number;
    swipeLength?: number;
  };
  trackStyle: Record<string, any>;
  trackWidth: number;
}

export interface InnerSliderRef {
  autoPlay: (playType: AutoPlayType) => void;
  changeSlide: (options: any, dontAnimate?: boolean) => void;
  pause: (pauseType: PauseType) => void;
  play: () => void;
  slickGoTo: (slide: number, dontAnimate?: boolean) => void;
  slickNext: () => void;
  slickPrev: () => void;
  slideHandler: (index: number, dontAnimate?: boolean) => void;
}

export interface TrackProps {
  centerMode?: boolean;
  centerPadding?: string;
  children: VNodeChild[];
  cssEase?: string;
  currentSlide: number;
  fade?: boolean;
  focusOnSelect?: (options: any) => void;
  infinite?: boolean;
  lazyLoad?: LazyLoadType;
  lazyLoadedList: number[];
  listHeight?: null | number;
  nodeRef?: Ref<HTMLDivElement | null>;
  onMouseEnter?: (e: MouseEvent) => void;
  onMouseLeave?: (e: MouseEvent) => void;
  onMouseOver?: (e: MouseEvent) => void;
  rtl?: boolean;
  slideCount: number;
  slideHeight?: null | number;
  slidesToScroll: number;
  slidesToShow: number;
  slideWidth?: null | number | string;
  speed?: number;
  targetSlide: number;
  trackStyle?: CSSProperties;
  unslick?: boolean;
  useCSS?: boolean;
  variableWidth?: boolean;
  vertical?: boolean;
}
