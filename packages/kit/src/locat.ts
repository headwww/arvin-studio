import staticLocation from './staticLocation';
import parseUrl from './parseUrl';

/**
 * 获取地址栏信息
 */
function locat(): any {
  return staticLocation ? parseUrl(staticLocation.href) : ({} as any);
}

export default locat;
