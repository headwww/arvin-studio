export interface TreeOptions {
  children?: string;
}

function helperCreateTreeFunc(handle: Function) {
  return function (
    obj: any,
    iterate: any,
    options?: TreeOptions,
    context?: any,
  ): any {
    const opts = options || {};
    const optChildren = opts.children || 'children';
    return handle(null, obj, iterate, context, [], [], optChildren, opts);
  };
}

export default helperCreateTreeFunc;
