import staticDocument from './staticDocument';

/**
 * 判断是否 Document 对象
 * @param val 值
 */
function isDocument(val: any): val is Document {
  return !!(val && staticDocument && val.nodeType === 9);
}

export default isDocument;
