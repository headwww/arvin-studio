/**
 * 以最快的方式判断数组，可忽略准确性
 */
function helperGetHGSKeys(property: any): string[] {
  return property
    ? (property as any).splice && (property as any).join
      ? property
      : `${property}`
          .replaceAll(/(\[\d+\])\.?/g, '$1.')
          .replace(/\.$/, '')
          .split('.')
    : [];
}

export default helperGetHGSKeys;
