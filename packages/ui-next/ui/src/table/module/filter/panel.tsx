import { defineComponent, ref } from 'vue';

import { uniqueId } from '@arvin-studio/kit';

import PositionPopup from '../../../position-popup';

export default defineComponent({
  name: 'AsTableFilterPanel',
  setup(props, context) {
    const xID = uniqueId();
    const refElem = ref<HTMLDivElement>();

    const refMaps = {
      refElem,
    };
    const $asFilterPanel: any = {
      xID,
      props,
      context,
      getRefMaps: () => refMaps,
    };

    const renderVN = () => {
      return <PositionPopup></PositionPopup>;
    };
    $asFilterPanel.renderVN = renderVN;

    return $asFilterPanel;
  },
  render() {
    // eslint-disable-next-line unicorn/no-this-outside-of-class
    return this.renderVN();
  },
});
