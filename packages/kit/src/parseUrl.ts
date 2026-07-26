import staticLocation from './staticLocation';
import unserialize from './unserialize';
import helperGetLocatOrigin from './helperGetLocatOrigin';

export interface AsUrl {
  /** 获取完整的地址 */
  href: string;
  /** 获取 #Hash 的完整字符串 */
  hash: string;
  /** 获取主机信息 */
  host: string;
  /** 主机主机名 */
  hostname: string;
  /** 获取地址的协议类型 */
  protocol: string;
  /** 获取端口信息 */
  port: string;
  /** 查询字符串 */
  search: string;
  /** 获取路径字符串 */
  pathname: string;
  /** 获取 #hash 键值 */
  origin: string;
  /** 获取 #hash 键值，不包括参数 */
  hashKey: string;
  /** 获取 #hash 对象参数 */
  hashQuery: any;
  /** 获取查询对象参数 */
  searchQuery: any;
  /** 内部路径缓存 */
  path?: string;
}

function parseURLQuery(uri: string): any {
  return unserialize(uri.split('?')[1] || '');
}

/**
 * 解析 URL 参数
 *
 * @param url - URL 字符串
 * @returns 解析后的 URL 对象
 */
function parseUrl(url: string): AsUrl;
function parseUrl(url: any): AsUrl;
function parseUrl(url: any): AsUrl {
  // oxlint-disable-next-line prefer-const
  let hashs: RegExpMatchArray | null;
  let portText: string;
  // oxlint-disable-next-line prefer-const
  let searchs: RegExpMatchArray | null;
  // oxlint-disable-next-line prefer-const
  let parsed: AsUrl;

  let href = `${url}`;

  if (href.indexOf('//') === 0) {
    href = (staticLocation ? staticLocation.protocol : '') + href;
  } else if (href.indexOf('/') === 0) {
    href = helperGetLocatOrigin() + href;
  }

  searchs = href.replace(/#.*/, '').match(/(\?.*)/);
  parsed = {
    href: href,
    hash: '',
    host: '',
    hostname: '',
    protocol: '',
    port: '',
    search: searchs && searchs[1] && searchs[1].length > 1 ? searchs[1] : '',
    path: '',
    pathname: '',
    origin: '',
    hashKey: '',
    hashQuery: null,
    searchQuery: null,
  };

  parsed.path = href
    .replace(/^([a-z0-9.+-]*:)\/\//, function (_: string, protocol: string) {
      parsed.protocol = protocol;
      return '';
    })
    .replace(
      /^([a-z0-9.+-]*)(:\d+)?\/?/,
      function (_: string, hostname: string, port: string) {
        portText = port || '';
        parsed.port = portText.replace(':', '');
        parsed.hostname = hostname;
        parsed.host = hostname + portText;
        return '/';
      },
    )
    .replace(/(#.*)/, function (_: string, hash: string) {
      parsed.hash = hash.length > 1 ? hash : '';
      return '';
    });

  hashs = parsed.hash.match(/#((.*)\?|(.*))/);
  parsed.pathname = parsed.path.replace(/(\?|#.*).*/, '') || '';
  parsed.origin = `${parsed.protocol}//${parsed.host}`;
  parsed.hashKey = hashs ? hashs[2] || hashs[1] || '' : '';
  parsed.hashQuery = parseURLQuery(parsed.hash);
  parsed.searchQuery = parseURLQuery(parsed.search);

  return parsed;
}

export default parseUrl;
