/**
 * 输出日志
 */
function helperLog(type: string, msg: any): void {
  return (console as any)[type]
    ? (console as any)[type](msg)
    : // oxlint-disable-next-line no-console
      console.log(msg);
}

export default helperLog;
