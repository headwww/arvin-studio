/**
 * 删除对象属性
 */
function helperDeleteProperty(
  obj: Record<string, any>,
  property: string,
): void {
  try {
    delete obj[property];
  } catch {
    obj[property] = undefined;
  }
}

export default helperDeleteProperty;
