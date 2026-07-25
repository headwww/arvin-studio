import staticEscapeMap from './staticEscapeMap';
import helperFormatEscaper from './helperFormatEscaper';

/**
 * 转义HTML字符串，替换&, <, >, ", ', `字符
 * @param str 字符串
 */
const escape: (str: string | null | undefined) => string =
  helperFormatEscaper(staticEscapeMap);

export default escape;
