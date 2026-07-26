import type { CommafyOptions } from './commafy';
import type { FirstDayOfWeek } from './getWhatWeek';
import type { ToDateStringFormats } from './toDateString';

export interface SetupDefaults {
  [key: string]: any;
  /** 分隔函数配置，用于 commafy() */
  commafyOptions?: CommafyOptions;
  cookies?: {
    path?: string;
  };
  /** 默认周视图的起始天，用于 getWhatWeek()、getYearWeek()、toDateString() */
  firstDayOfWeek?: FirstDayOfWeek;
  /** 已被 parseDateFormat 替换 @deprecated */
  formatString?: string;
  /** 已被 parseDateRules 替换 @deprecated */
  formatStringMatchs?: any;
  /** 全局唯一标识 */
  keyId?: number;
  /** 默认解析的日期格式，用于 toDateString() */
  parseDateFormat?: string;
  /** 默认格式化日期的规则，用于 toDateString() */
  parseDateRules?: ToDateStringFormats;
  /** 默认树的转换配置，用于 toArrayTree()、toTreeArray() */
  treeOptions?: {
    [key: string]: any;
    children?: string;
    data?: string;
    key?: string;
    parentKey?: string;
    strict?: boolean;
  };
}

const setupDefaults: SetupDefaults = {
  keyId: 1,
  cookies: {
    path: '/',
  },
  treeOptions: {
    parentKey: 'parentId',
    key: 'id',
    children: 'children',
  },
  parseDateFormat: 'yyyy-MM-dd HH:mm:ss',
  firstDayOfWeek: 1,
};

export default setupDefaults;
