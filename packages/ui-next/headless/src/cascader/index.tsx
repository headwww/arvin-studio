import Cascader from './Cascader';
import CascaderPanel from './Panel';
import {
  SHOW_CHILD as CASCADER_SHOW_CHILD,
  SHOW_PARENT as CASCADER_SHOW_PARENT,
} from './utils/commonUtil';

export type {
  BaseOptionType as CascaderBaseOptionType,
  DefaultOptionType as CascaderDefaultOptionType,
  FieldNames as CascaderFieldNames,
  CascaderProps,
  CascaderRef,
  SearchConfig as CascaderSearchConfig,
} from './Cascader';

export { CASCADER_SHOW_CHILD, CASCADER_SHOW_PARENT, CascaderPanel };

type CascaderType = typeof Cascader & {
  CASCADER_SHOW_CHILD: typeof CASCADER_SHOW_CHILD;
  CASCADER_SHOW_PARENT: typeof CASCADER_SHOW_PARENT;
  CascaderPanel: typeof CascaderPanel;
};

const ExportCascader = Cascader as CascaderType;
ExportCascader.CascaderPanel = CascaderPanel;
ExportCascader.CASCADER_SHOW_CHILD = CASCADER_SHOW_CHILD;
ExportCascader.CASCADER_SHOW_PARENT = CASCADER_SHOW_PARENT;

export default ExportCascader;
export { ExportCascader };
