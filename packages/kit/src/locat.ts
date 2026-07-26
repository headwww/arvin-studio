import parseUrl from './parseUrl';
import staticLocation from './staticLocation';

/**
 * 获取地址栏信息
 */
function locat(): any {
  return staticLocation ? parseUrl(staticLocation.href) : ({} as any);
}

export default locat;
