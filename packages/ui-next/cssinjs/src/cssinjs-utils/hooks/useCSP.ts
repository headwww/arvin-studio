import type { Ref } from 'vue';

import { ref } from 'vue';

export type UseCSP = () => Ref<{
  nonce?: string;
}>;

const useDefaultCSP: UseCSP = () => ref({});

export default useDefaultCSP;
