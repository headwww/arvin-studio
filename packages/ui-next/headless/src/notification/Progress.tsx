import type { CSSProperties } from 'vue';

import { defineComponent } from 'vue';

export interface NotificationProgressProps {
  className?: string;
  percent: number;
  style?: CSSProperties;
}

const Progress = defineComponent<NotificationProgressProps>(
  (props) => {
    return () => (
      <progress
        class={props.className}
        max="100"
        style={props.style}
        value={props.percent}
      />
    );
  },
  {
    name: 'NotificationProgress',
    inheritAttrs: false,
  },
);

export default Progress;
