import type { SlotsType } from 'vue';

import type { EmptyEmit } from '../_util';
import type { TimelineItemType } from './Timeline.tsx';

import { defineComponent } from 'vue';

export const TIMELINE_ITEM_MARK = '_ASDV_NEXT_TIMELINE_ITEM';

export interface TimelineItemProps extends Omit<
  TimelineItemType,
  'children' | 'class' | 'classes' | 'className' | 'key' | 'style' | 'styles'
> {}

export interface TimelineItemSlots {
  content?: () => any;
  icon?: () => any;
  title?: () => any;
}

export const TimelineItem = defineComponent<
  TimelineItemProps,
  EmptyEmit,
  string,
  SlotsType<TimelineItemSlots>
>(
  () => {
    return () => null;
  },
  {
    name: 'ATimelineItem',
    inheritAttrs: false,
  },
);

(TimelineItem as any)[TIMELINE_ITEM_MARK] = true;
