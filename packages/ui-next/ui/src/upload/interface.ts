import type { CSSProperties, ImgHTMLAttributes, VNodeChild } from 'vue';

import type {
  AcceptConfig,
  VcFile as OriVcFile,
  UploadRequestOption as VcCustomRequestOptions,
} from '@arvin-studio/headless';

import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type { ProgressAriaProps, ProgressProps } from '../progress';

export type UploadFileStatus = 'done' | 'error' | 'removed' | 'uploading';
export interface HttpRequestHeader {
  [key: string]: string;
}

export interface VcFile extends OriVcFile {
  readonly lastModifiedDate: Date;
}

export interface UploadFile<T = any> extends ProgressAriaProps {
  crossorigin?: ImgHTMLAttributes['crossorigin'];
  error?: any;
  fileName?: string;
  lastModified?: number;
  lastModifiedDate?: Date;
  linkProps?: any;
  name: string;
  originFileObj?: VcFile;
  percent?: number;
  preview?: string;
  response?: T;
  size?: number;
  status?: UploadFileStatus;
  thumbUrl?: string;
  type?: string;
  uid: string;
  url?: string;
  xhr?: T;
}

export interface InternalUploadFile<T = any> extends UploadFile<T> {
  originFileObj: VcFile;
}

export interface UploadChangeParam<T = UploadFile> {
  event?: { percent: number };
  // https://github.com/ant-design/ant-design/issues/14420
  file: T;
  fileList: T[];
}

export interface ShowUploadListInterface<T = any> {
  downloadIcon?: ((file: UploadFile<T>) => VNodeChild) | VNodeChild;
  extra?: ((file: UploadFile<T>) => VNodeChild) | VNodeChild;
  previewIcon?: ((file: UploadFile<T>) => VNodeChild) | VNodeChild;
  removeIcon?: ((file: UploadFile<T>) => VNodeChild) | VNodeChild;
  showDownloadIcon?: ((file: UploadFile<T>) => boolean) | boolean;
  showPreviewIcon?: ((file: UploadFile<T>) => boolean) | boolean;
  showRemoveIcon?: ((file: UploadFile<T>) => boolean) | boolean;
}

export interface UploadLocale {
  downloadFile?: string;
  previewFile?: string;
  removeFile?: string;
  uploadError?: string;
  uploading?: string;
}

export type UploadType = 'drag' | 'select';
export type UploadListType =
  | 'picture'
  | 'picture-card'
  | 'picture-circle'
  | 'text';
export type UploadListProgressProps = Omit<ProgressProps, 'percent' | 'type'>;

export type ItemRender<T = any> = (
  originNode: VNodeChild,
  file: UploadFile<T>,
  fileList: Array<UploadFile<T>>,
  actions: {
    download: () => void;
    preview: () => void;
    remove: () => void;
  },
) => VNodeChild;

type PreviewFileHandler = (file: Blob | File) => PromiseLike<string>;
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
type BeforeUploadValueType = Blob | boolean | File | string | void;

export type UploadSemanticName = keyof UploadSemanticClassNames &
  keyof UploadSemanticStyles;

export interface UploadSemanticClassNames {
  item?: string;
  list?: string;
  root?: string;
  trigger?: string;
}

export interface UploadSemanticStyles {
  item?: CSSProperties;
  list?: CSSProperties;
  root?: CSSProperties;
  trigger?: CSSProperties;
}

export type UploadClassNamesType<T = any> = SemanticClassNamesType<
  UploadProps<T>,
  UploadSemanticClassNames
>;

export type UploadStylesType<T = any> = SemanticStylesType<
  UploadProps<T>,
  UploadSemanticStyles
>;

export interface UploadProps<T = any> {
  accept?: AcceptConfig | string;
  action?:
    | ((file: VcFile) => PromiseLike<string>)
    | ((file: VcFile) => string)
    | string;
  beforeUpload?: (
    file: VcFile,
    fileList: VcFile[],
  ) => BeforeUploadValueType | Promise<BeforeUploadValueType>;
  capture?: boolean | string;
  classes?: UploadClassNamesType;
  customRequest?: (
    options: VcCustomRequestOptions<T>,
    info: {
      /**
       * @since 5.28.0
       */
      defaultRequest: (option: VcCustomRequestOptions<T>) => void;
    },
  ) => void;
  data?:
    | ((
        file: UploadFile<T>,
      ) => Promise<Record<string, unknown>> | Record<string, unknown>)
    | Record<string, unknown>;
  defaultFileList?: Array<UploadFile<T>>;
  directory?: boolean;
  disabled?: boolean;
  fileList?: Array<UploadFile<T>>;
  hasControlInside?: boolean;
  headers?: HttpRequestHeader;
  iconRender?: (file: UploadFile<T>, listType?: UploadListType) => VNodeChild;
  id?: string;
  isImageUrl?: (file: UploadFile<T>) => boolean;
  itemRender?: ItemRender<T>;
  listType?: UploadListType;
  locale?: UploadLocale;
  /** Config max count of `fileList`. Will replace current one when `maxCount` is 1 */
  maxCount?: number;
  method?: 'PATCH' | 'patch' | 'POST' | 'post' | 'PUT' | 'put';
  multiple?: boolean;
  name?: string;
  onDownload?: (file: UploadFile<T>) => void;
  onPreview?: (file: UploadFile<T>) => void;
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  onRemove?: (file: UploadFile<T>) => boolean | Promise<boolean | void> | void;
  openFileDialogOnClick?: boolean;
  pastable?: boolean;
  prefixCls?: string;
  previewFile?: PreviewFileHandler;
  progress?: UploadListProgressProps;
  rootClass?: string;
  showUploadList?: boolean | ShowUploadListInterface<T>;
  styles?: UploadStylesType;
  supportServerRender?: boolean;
  type?: UploadType;
  withCredentials?: boolean;
}

// click: VcUploadProps['onClick']
// error: VcUploadProps['onError']
// start: VcUploadProps['onStart']
// batchStart: VcUploadProps['onBatchStart']
// success: VcUploadProps['onSuccess']
// progress: VcUploadProps['onProgress']
// mouseenter: VcUploadProps['onMouseEnter']
// mouseleave: VcUploadProps['onMouseLeave']
export interface UploadEmits<T = any> {
  change: (info: UploadChangeParam<UploadFile<T>>) => void;
  drop: (event: DragEvent) => void;
  // 'preview': (file: UploadFile<T>) => void
  // 'download': (file: UploadFile<T>) => void
  'update:fileList': (fileList: UploadFile<T>[]) => void;
}

export interface UploadSlots<T = any> {
  default?: () => any;
  iconRender?: (props: {
    file: UploadFile<T>;
    listType?: UploadListType;
  }) => VNodeChild;
  itemRender?: (props: {
    actions: {
      download: () => void;
      preview: () => void;
      remove: () => void;
    };
    file: UploadFile<T>;
    fileList: Array<UploadFile<T>>;
    originNode: VNodeChild;
  }) => VNodeChild;
}

export interface UploadState<T = any> {
  dragState: string;
  fileList: UploadFile<T>[];
}

export interface UploadListProps<T = any> {
  appendAction?: any;
  appendActionVisible?: boolean;
  classes?: UploadClassNamesType;
  /**
   * @internal Only the internal remove button is provided for use
   */
  disabled?: boolean;
  downloadIcon?: ((file: UploadFile<T>) => VNodeChild) | VNodeChild;
  extra?: ((file: UploadFile<T>) => VNodeChild) | VNodeChild;
  iconRender?: (file: UploadFile<T>, listType?: UploadListType) => VNodeChild;
  isImageUrl?: (file: UploadFile<T>) => boolean;
  itemRender?: ItemRender<T>;
  items?: Array<UploadFile<T>>;
  listType?: UploadListType;
  locale: UploadLocale;
  onDownload?: (file: UploadFile<T>) => void;
  onPreview?: (file: UploadFile<T>) => void;
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  onRemove?: (file: UploadFile<T>) => boolean | void;
  prefixCls?: string;
  previewFile?: PreviewFileHandler;
  previewIcon?: ((file: UploadFile<T>) => VNodeChild) | VNodeChild;
  progress?: UploadListProgressProps;
  removeIcon?: ((file: UploadFile<T>) => VNodeChild) | VNodeChild;
  showDownloadIcon?: ((file: UploadFile<T>) => boolean) | boolean;
  showPreviewIcon?: ((file: UploadFile<T>) => boolean) | boolean;
  showRemoveIcon?: ((file: UploadFile<T>) => boolean) | boolean;
  styles?: UploadStylesType;
}

export interface UploadListEmits {}

export interface UploadListSlots<T = any> {
  downloadIcon?: (props: { file: UploadFile<T> }) => VNodeChild;
  iconRender?: (props: {
    file: UploadFile<T>;
    listType?: UploadListType;
  }) => VNodeChild;
  itemRender?: (props: {
    actions: {
      download: () => void;
      preview: () => void;
      remove: () => void;
    };
    file: UploadFile<T>;
    fileList: Array<UploadFile<T>>;
    originNode: VNodeChild;
  }) => VNodeChild;
  previewIcon?: (props: { file: UploadFile<T> }) => VNodeChild;
  removeIcon?: (props: { file: UploadFile<T> }) => VNodeChild;
}
