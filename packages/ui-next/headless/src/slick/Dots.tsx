import type { VNodeChild } from 'vue';

import { cloneVNode, defineComponent, isVNode } from 'vue';

import { clsx } from '@arvin-studio/kit';

import defaultProps from './default-props';
import { clamp } from './utils/innerSliderUtils';

interface DotsProps {
  appendDots?: (dots: VNodeChild[]) => VNodeChild;
  clickHandler?: (options: any, e?: MouseEvent) => void;
  currentSlide: number;
  customPaging?: (index: number) => VNodeChild;
  dotsClass: string;
  infinite?: boolean;
  onMouseEnter?: (e: MouseEvent) => void;
  onMouseLeave?: (e: MouseEvent) => void;
  onMouseOver?: (e: MouseEvent) => void;
  slideCount: number;
  slidesToScroll: number;
  slidesToShow: number;
}

function getDotCount(spec: {
  infinite?: boolean;
  slideCount: number;
  slidesToScroll: number;
  slidesToShow: number;
}) {
  if (spec.infinite) {
    return Math.ceil(spec.slideCount / spec.slidesToScroll);
  }
  return (
    Math.ceil((spec.slideCount - spec.slidesToShow) / spec.slidesToScroll) + 1
  );
}

const Dots = defineComponent<DotsProps>((props) => {
  const getCustomPaging =
    props.customPaging ??
    defaultProps.customPaging ??
    ((index: number) => <button type="button">{index + 1}</button>);
  const appendDots =
    props.appendDots ??
    defaultProps.appendDots ??
    ((dots: VNodeChild[]) => <ul style={{ display: 'block' }}>{dots}</ul>);

  const clickHandler = (options: any, e?: MouseEvent) => {
    e?.preventDefault();
    props.clickHandler?.(options, e);
  };

  return () => {
    const {
      onMouseEnter,
      onMouseOver,
      onMouseLeave,
      infinite,
      slidesToScroll,
      slidesToShow,
      slideCount,
      currentSlide,
    } = props;
    const dotCount = getDotCount({
      slideCount,
      slidesToScroll,
      slidesToShow,
      infinite,
    });

    const dots: VNodeChild[] = [];
    for (let i = 0; i < dotCount; i += 1) {
      const _rightBound = (i + 1) * slidesToScroll - 1;
      const rightBound = infinite
        ? _rightBound
        : clamp(_rightBound, 0, slideCount - 1);
      const _leftBound = rightBound - (slidesToScroll - 1);
      const leftBound = infinite
        ? _leftBound
        : clamp(_leftBound, 0, slideCount - 1);

      const className = clsx({
        'slick-active': infinite
          ? currentSlide >= leftBound && currentSlide <= rightBound
          : currentSlide === leftBound,
      });

      const dotOptions = {
        message: 'dots',
        index: i,
        slidesToScroll,
        currentSlide,
      };
      const onClick = (e: MouseEvent) => clickHandler(dotOptions, e);
      const paging = getCustomPaging(i);
      const content = isVNode(paging) ? (
        cloneVNode(paging, { onClick })
      ) : (
        <button onClick={onClick} type="button">
          {i + 1}
        </button>
      );

      dots.push(
        <li class={className} key={i}>
          {content}
        </li>,
      );
    }

    const dotsNode = appendDots(dots);
    if (isVNode(dotsNode)) {
      return cloneVNode(dotsNode, {
        class: props.dotsClass,
        onMouseenter: onMouseEnter,
        onMouseover: onMouseOver,
        onMouseleave: onMouseLeave,
      });
    }

    return dotsNode;
  };
});

export default Dots;
