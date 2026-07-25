import staticLocation from './staticLocation';

/**
 * 获取当前页面地址信息
 */
function helperGetLocatOrigin(): string {
  return staticLocation
    ? staticLocation.origin ||
        `${staticLocation.protocol}//${staticLocation.host}`
    : '';
}

export default helperGetLocatOrigin;
