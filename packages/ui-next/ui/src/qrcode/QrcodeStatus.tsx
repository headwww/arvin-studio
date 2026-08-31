import type { Locale } from '../locale';
import type { QRCodeProps, StatusRenderInfo } from './interface.ts';

import { defineComponent } from 'vue';

import { ReloadOutlined } from '@arvin-studio/icons';

import Button from '../button';
import Spin from '../spin';

export interface QRcodeStatusProps {
  locale?: Locale['QRCode'];
  onRefresh?: () => void;
  prefixCls: string;
  status: StatusRenderInfo['status'];
  statusRender?: QRCodeProps['statusRender'];
}
const defaultSpin = <Spin />;

const QRcodeStatus = defineComponent<QRcodeStatusProps>((props) => {
  return () => {
    const { prefixCls, locale, onRefresh, statusRender, status } = props;

    const defaultExpiredNode = (
      <>
        <p class={`${prefixCls}-expired`}>{locale?.expired}</p>
        {onRefresh && (
          <Button
            icon={() => <ReloadOutlined />}
            onClick={onRefresh}
            type="link"
          >
            {locale?.refresh}
          </Button>
        )}
      </>
    );

    const defaultScannedNode = (
      <p class={`${prefixCls}-scanned`}>{locale?.scanned}</p>
    );

    const defaultNodes = {
      expired: defaultExpiredNode,
      loading: defaultSpin,
      scanned: defaultScannedNode,
    };

    const defaultStatusRender: QRCodeProps['statusRender'] = (info) =>
      defaultNodes[info.status];

    const mergedStatusRender = statusRender ?? defaultStatusRender;

    return mergedStatusRender({
      status,
      locale,
      onRefresh,
    });
  };
});

export default QRcodeStatus;
