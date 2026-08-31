import { ref } from 'vue';

import { canUseDom } from '../../util';

let uuid = 0;

// @ts-expect-error this is a global variable which injected by babel plugin
// eslint-disable-next-line n/prefer-global/process
export const isBrowserClient = process.env.NODE_ENV !== 'test' && canUseDom();

function getUUID(): number | string {
  let retId: number | string;
  if (isBrowserClient) {
    retId = uuid;
    uuid += 1;
  } else {
    retId = 'TEST_OR_SSR';
  }
  return retId;
}

const useId = (id?: string) => {
  const innerId = ref<string>();
  innerId.value = `as_progress_${getUUID()}`;
  return id || innerId.value;
};
export default useId;
