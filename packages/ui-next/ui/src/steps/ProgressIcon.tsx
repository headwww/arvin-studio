import { defineComponent } from 'vue';

import { clsx } from '@arvin-studio/kit';

import { genCssVar } from '../theme/util/genStyleUtils';

export interface ProgressIconProps {
  percent: number;
  prefixCls: string;
  rootPrefixCls: string;
}

const ProgressIcon = defineComponent<ProgressIconProps>(
  (props, { slots }) => {
    return () => {
      const { prefixCls, rootPrefixCls, percent } = props;

      const progressCls = `${prefixCls}-item-progress-icon`;
      const circleCls = `${progressCls}-circle`;

      const [, varRef] = genCssVar(rootPrefixCls, 'cmp-steps');
      const dashArray = `calc(${varRef('progress-radius')} * 2 * ${(Math.PI * percent) / 100}) 9999`;

      return (
        <>
          <svg
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={percent}
            class={`${progressCls}-svg`}
            height="100%"
            viewBox="0 0 100 100"
            width="100%"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Progress</title>
            <circle class={clsx(circleCls, `${circleCls}-rail`)} />
            <circle
              class={clsx(circleCls, `${circleCls}-ptg`)}
              stroke-dasharray={dashArray}
              transform="rotate(-90 50 50)"
            />
          </svg>
          {slots?.default?.()}
        </>
      );
    };
  },
  {
    name: 'ProgressIcon',
  },
);

export default ProgressIcon;
