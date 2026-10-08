/**
 * 组件日志消息默认目录（英文）
 *
 * 约定：
 * - key 是稳定标识，不要用整句当 key（句子改了翻译就丢）
 * - `{0}` `{1}` 为位置占位符，由 formatMessage 插值
 * - key 与 vxe 的 `vxe.error.*` 语义对齐，便于从 vxe-table 迁移
 * - 可通过语言包 `Locale.Logger` 或 `<ConfigProvider :logging="{ messages }" />` 逐条覆盖
 */
export const defaultLogMessages: Record<string, string> = {
  // 通用
  deprecated: '`{0}` is deprecated. Please use `{1}` instead.{2}',
  downErr: '下载失败',
  errLargeData: '当绑定的数据量过大时，应该请使用 {0}，否则可能会出现卡顿',
  groupFixed: '如果使用分组表头，冻结列必须按组设置',
  groupMouseRange: '分组表头与 "{0}" 不能同时使用，这可能会出现错误',
  groupTag: '分组列头应该使用 "{0}" 而不是 "{1}"，这可能会出现错误',
  scrollErrProp: '启用虚拟滚动后不支持该参数 "{0}"',
  errConflicts: '参数 "{0}" 与 "{1}" 有冲突',
  modelConflicts: '绑定的字段值 "{0}" 与 "{1}" 存在冲突，将会出现错误',
  notSupportProp:
    '当启用参数 "{0}" 时不支持 "{1}"，应该为 "{2}"，否则将会出现错误',
  reqSupportProp: '当使用 "{0}" 时，应该设置 "{1}"，否则可能会出现错误',
  notConflictProp: '当使用 "{0}" 时，应该设置 "{1}"，否则可能会存在功能冲突',
  unableInsert: '无法插入到指定位置，请检查参数是否正确',
  useErr:
    '安装 "{0}" 模块时发生错误，可能顺序不正确，依赖的模块需要在 Table 之前安装',
  barUnableLink: '工具栏无法关联表格',
  expandContent: '展开行的插槽应该是 "content"，请检查是否正确',
  reqModule: '缺少 "{0}" 模块',
  reqProp: '缺少必要的 "{0}" 参数，这可能会导致出现错误',
  emptyProp: '参数 "{0}" 不允许为空',
  errProp: '不支持的参数 "{0}"，可能为 "{1}"',
  colRepet: 'column.{0}="{1}" 重复了，这可能会导致某些功能无法使用',
  notFunc: '方法 "{0}" 不存在',
  errFunc: '参数 "{0}" 不是一个方法',
  notValidators: '全局校验 "{0}" 不存在',
  notFormats: '全局格式化 "{0}" 不存在',
  notCommands: '全局指令 "{0}" 不存在',
  notSlot: '插槽 "{0}" 不存在',
  noTree: '树结构不支持 "{0}"',
  noGroup: '数据分组后不支持 "{0}"',
  notProp: '不支持的参数 "{0}"',
  returnErr: '参数 "{0}" 的返回值期望是 "{1}" 实际是 "{2}"',
  notSupportReturn: '当返回值为 "{0}" 时的参数应该使用用 "{1}" 而不是 "{2}"',
  checkProp:
    '当数据量过大时可能会导致复选框卡顿，建议设置参数 "{0}" 提升渲染速度',
  coverProp: '"{0}" 的参数 "{1}" 重复定义，这可能会出现错误',
  uniField: '字段名 "{0}" 重复定义，这可能会出现错误',
  repeatKey: '主键重复 {0}="{1}"，这可能会出现错误',
  repeatProp: '参数重复 {0}="{1}"，这可能会出现错误',
  delFunc: '方法 "{0}" 已废弃，请使用 "{1}"',
  delProp: '参数 "{0}" 已废弃，请使用 "{1}"',
  delEvent: '事件 "{0}" 已废弃，请使用 "{1}"',
  removeProp: '参数 "{0}" 已废弃，不建议使用，这可能会导致出现错误',
  errFormat:
    '全局的格式化内容应该使用 "VXETable.formats" 定义，挂载 "formatter={0}" 的方式已不建议使用',
  notType: '不支持的文件类型 "{0}"',
  notExp: '该浏览器不支持导入/导出功能',
  impFields: '导入失败，请检查字段名和数据格式是否正确',
  treeNotImp: '树表格不支持导入',
  treeCrossDrag: '只能拖拽第一层级',
  treeDragChild: '父级不能拖拽到自己的子级中',
  errMaxRow: '超过支持的最大数据量 {0} 行，这可能会导致出现错误',
  useNew: '不建议使用 {0}，请使用 {1}',
  errorVersion: '版本不匹配，当前版本 {0}，最低支持版本为 {1}',
};

export default defaultLogMessages;
