/* eslint-disable @typescript-eslint/no-invalid-void-type */
import type { Component, CSSProperties } from 'vue';

export interface VcFile extends File {
  uid: string;
}

export type BeforeUploadFileType = Blob | boolean | File | string;

export type Action = ((file: VcFile) => PromiseLike<string> | string) | string;

export interface AcceptConfig {
  filter?: 'native' | ((file: VcFile) => boolean);
  format: string;
}

export type UploadRequestMethod =
  | 'PATCH'
  | 'patch'
  | 'POST'
  | 'post'
  | 'PUT'
  | 'put';

export type UploadRequestHeader = Record<string, string>;

export type UploadRequestFile =
  | Exclude<BeforeUploadFileType, boolean | File>
  | VcFile;

export interface UploadRequestError extends Error {
  method?: UploadRequestMethod;
  status?: number;
  url?: string;
}

export interface UploadProgressEvent extends Partial<ProgressEvent> {
  percent?: number;
}

export interface AjaxUploaderExpose {
  abort: (file: any) => void;
}

export interface UploadRequestOption<T = any> {
  action: string;
  data?: Record<string, unknown>;
  file: UploadRequestFile;
  filename?: string;
  headers?: UploadRequestHeader;
  method: UploadRequestMethod;
  onError?: (event: ProgressEvent | UploadRequestError, body?: T) => void;
  onProgress?: (event: UploadProgressEvent, file?: UploadRequestFile) => void;
  onSuccess?: (body: T, fileOrXhr?: UploadRequestFile | XMLHttpRequest) => void;
  withCredentials?: boolean;
}

export type CustomUploadRequestOption = (
  option: UploadRequestOption,
  info: {
    defaultRequest: (
      option: UploadRequestOption,
    ) => void | { abort: () => void };
  },
) => void | { abort: () => void };

export interface UploadProps {
  accept?: AcceptConfig | string;
  action?: Action;
  beforeUpload?: (
    file: VcFile,
    FileList: VcFile[],
  ) => BeforeUploadFileType | Promise<BeforeUploadFileType | void> | void;
  className?: string;
  classNames?: {
    input?: string;
  };
  component?: Component | string;
  customRequest?: CustomUploadRequestOption;
  data?:
    | ((file: Blob | string | VcFile) => Record<string, unknown>)
    | Record<string, unknown>;
  directory?: boolean;
  disabled?: boolean;
  hasControlInside?: boolean;
  headers?: UploadRequestHeader;
  id?: string;
  method?: UploadRequestMethod;
  multiple?: boolean;
  name?: string;
  onBatchStart?: (
    fileList: {
      file: VcFile;
      parsedFile: Exclude<BeforeUploadFileType, boolean> | null;
    }[],
  ) => void;
  onClick?: (e: KeyboardEvent | MouseEvent) => void;
  onError?: (
    error: Error,
    ret: Record<string, unknown>,
    file: null | VcFile,
  ) => void;
  onMouseEnter?: (e: MouseEvent) => void;
  onMouseLeave?: (e: MouseEvent) => void;
  onProgress?: (event: UploadProgressEvent, file: null | VcFile) => void;
  onStart?: (file: VcFile) => void;
  onSuccess?: (
    response: Record<string, unknown>,
    file: null | VcFile,
    xhr: XMLHttpRequest,
  ) => void;
  openFileDialogOnClick?: boolean;
  pastable?: boolean;
  prefixCls?: string;
  style?: CSSProperties;
  styles?: {
    input?: CSSProperties;
  };
  withCredentials?: boolean;
}
