// GENERATE BY ./scripts/gen-icons.ts
// DON NOT EDIT IT MANUALLY

import type { AsIconProps } from '../components/AsIcon';
import AntDesignOutlinedSvg from '@arvin-studio/icons-svg/es/asn/AntDesignOutlined.js';
import { defineComponent } from 'vue';
import AsIcon from '../components/AsIcon';

const AntDesignOutlined = defineComponent<AsIconProps>(
  (props) => {
    return () => {
      return <AsIcon {...props} icon={AntDesignOutlinedSvg} />;
    };
  },
  {
    name: 'AntDesignOutlined',
  },
);

export default AntDesignOutlined;
