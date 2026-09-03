import type { PickerMode } from '@arvin-studio/headless';

import type { VueNode } from '../../_util';

import { defineComponent } from 'vue';

import { CalendarOutlined, ClockCircleOutlined } from '@arvin-studio/icons';

import { TIME } from './constant';

export interface SuffixIconProps {
  feedbackIcon?: VueNode;
  hasFeedback?: boolean;
  picker?: PickerMode;
  suffixIcon?: VueNode;
}

const SuffixIcon = defineComponent<SuffixIconProps>(
  (props) => {
    return () => {
      const { picker, hasFeedback, feedbackIcon, suffixIcon } = props;
      if (suffixIcon === null || suffixIcon === false) {
        return null;
      }
      if (suffixIcon === true || suffixIcon === undefined) {
        return (
          <>
            {picker === TIME ? (
              <ClockCircleOutlined aria-hidden="true" />
            ) : (
              <CalendarOutlined aria-hidden="true" />
            )}
            {hasFeedback ? feedbackIcon : null}
          </>
        );
      }

      return suffixIcon as any;
    };
  },
  {
    name: 'APickerSuffixIcon',
  },
);

export default SuffixIcon;
