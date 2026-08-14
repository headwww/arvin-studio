import type { Ref } from 'vue';

import type { WaveProps } from '.';
import type { ShowWave, WaveComponent } from './interface';

import { onBeforeUnmount, ref, unref } from 'vue';

import { raf } from '@arvin-studio/headless';

import { useConfig } from '../../config-provider/context';
import useToken from '../../theme/useToken';
import { TARGET_CLS } from './interface';
import showWaveEffect from './WaveEffect';

export default function useWave(
  nodeRef: Ref<HTMLElement | null | undefined>,
  className: Ref<string> | string,
  component?: Ref<undefined | WaveComponent> | WaveComponent,
  colorSource?: Ref<WaveProps['colorSource']>,
) {
  const configCtx = useConfig();
  const [, token, hashId] = useToken();

  const showWave: ShowWave = (event) => {
    const node = nodeRef.value;
    if (!node) {
      return;
    }
    const waveConfig = configCtx.value.wave;
    if (waveConfig?.disabled) {
      return;
    }

    const targetNode =
      node.querySelector<HTMLElement>(`.${TARGET_CLS}`) || node;
    const { showEffect } = waveConfig ?? ({} as any);

    (showEffect || showWaveEffect)(targetNode, {
      className: unref(className),
      token: token?.value,
      component: unref(component) ?? undefined,
      event,
      hashId: hashId?.value,
      colorSource: colorSource ? unref(colorSource) : undefined,
    });
  };

  const rafId = ref<number>();

  const showDebounceWave: ShowWave = (event) => {
    if (rafId.value !== undefined) {
      raf.cancel(rafId.value);
    }
    rafId.value = raf(() => {
      showWave(event);
    });
  };

  onBeforeUnmount(() => {
    if (rafId.value !== undefined) {
      raf.cancel(rafId.value);
    }
  });

  return showDebounceWave;
}
