import helperFormatEscaper from './helperFormatEscaper';
import staticEscapeMap from './staticEscapeMap';

/**
 * 转义HTML字符串，替换&, <, >, ", ', `字符
 * @param str 字符串
 */
const escape: (str: null | string | undefined) => string =
  helperFormatEscaper(staticEscapeMap);

export default escape;
