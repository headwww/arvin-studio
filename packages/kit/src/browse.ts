import staticStrUndefined from './staticStrUndefined';
import staticDocument from './staticDocument';
import staticWindow from './staticWindow';
import assign from './assign';
import arrayEach from './arrayEach';

export interface BrowseResult {
  /**
   * 判断是否 NodeJs 环境
   */
  isNode: boolean;
  /**
   * 判断是否有 document 元素
   */
  isDoc: boolean;
  /**
   * 判断是否 Edge 浏览器
   */
  edge?: boolean;
  /**
   * 判断是否 Firefox 浏览器
   */
  firefox?: boolean;
  /**
   * 判断是否 IE 浏览器
   */
  msie?: boolean;
  /**
   * 判断是否 Safari 浏览器
   */
  safari?: boolean;
  /**
   * 判断是否移动端
   */
  isMobile: boolean;
  /**
   * 判断是否 PC 端
   */
  isPC: boolean;
  /**
   * 判断浏览器是否支持 LocalStorage
   */
  isLocalStorage?: boolean;
  /**
   * 判断浏览器是否支持 SessionStorage
   */
  isSessionStorage?: boolean;
  /**
   * 判断浏览器是否 -webkit 内核
   */
  '-webkit'?: boolean;
  /**
   * 判断浏览器是否 -moz 内核
   */
  '-moz'?: boolean;
  /**
   * 判断浏览器是否 -ms 内核
   */
  '-ms'?: boolean;
  /**
   * 判断浏览器是否 -o 内核
   */
  '-o'?: boolean;
}

declare const process: any;
declare const navigator: Navigator;

function isBrowseStorage(storage: Storage): boolean {
  try {
    const testKey = '__xe_t';
    storage.setItem(testKey, '1');
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function isBrowseType(type: string): boolean {
  return navigator.userAgent.indexOf(type) > -1;
}

/**
 * 获取浏览器信息
 */
function browse(): BrowseResult {
  let $body: any;
  let isChrome: boolean;
  let isEdge: boolean;
  let isMobile = false;
  let isLocalStorage = false;
  let isSessionStorage = false;
  const result: BrowseResult = {
    isNode: false,
    isMobile: isMobile,
    isPC: false,
    isDoc: !!staticDocument,
  };
  // oxlint-disable-next-line valid-typeof
  if (!staticWindow && typeof process !== staticStrUndefined) {
    result.isNode = true;
  } else {
    isEdge = isBrowseType('Edge');
    isChrome = isBrowseType('Chrome');
    isMobile =
      /(Android|webOS|iPhone|iPad|iPod|SymbianOS|BlackBerry|Windows Phone)/.test(
        navigator.userAgent,
      );
    if (result.isDoc && staticDocument) {
      $body = staticDocument.body || staticDocument.documentElement;
      arrayEach(['webkit', 'khtml', 'moz', 'ms', 'o'], function (core: string) {
        (result as any)[`-${core}`] = !!($body as any)[
          `${core}MatchesSelector`
        ];
      });
    }
    try {
      if (staticWindow) {
        isLocalStorage = isBrowseStorage(staticWindow.localStorage);
      }
    } catch {}
    try {
      if (staticWindow) {
        isSessionStorage = isBrowseStorage(staticWindow.sessionStorage);
      }
    } catch {}
    assign(result, {
      edge: isEdge,
      firefox: isBrowseType('Firefox'),
      msie: !isEdge && result['-ms'],
      safari: !isChrome && !isEdge && isBrowseType('Safari'),
      isMobile: isMobile,
      isPC: !isMobile,
      isLocalStorage: isLocalStorage,
      isSessionStorage: isSessionStorage,
    });
  }
  return result;
}

export default browse;
