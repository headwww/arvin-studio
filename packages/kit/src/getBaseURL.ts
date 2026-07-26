import helperGetLocatOrigin from './helperGetLocatOrigin';
import lastIndexOf from './lastIndexOf';
import staticLocation from './staticLocation';

/**
 * 获取上下文路径
 */
function getBaseURL(): string {
  if (staticLocation) {
    const pathname = staticLocation.pathname;
    const lastIndex =
      (lastIndexOf as (obj: any, val: any) => number)(pathname, '/') + 1;
    return (
      helperGetLocatOrigin() +
      (lastIndex === pathname.length
        ? pathname
        : pathname.substring(0, lastIndex))
    );
  }
  return '';
}

export default getBaseURL;
