import type { SlotsType } from 'vue';

import type { EmptyEmit } from '../../_util';
import type {
  ItemRender,
  UploadFile,
  UploadListProgressProps,
  UploadListType,
  UploadLocale,
  UploadSemanticClassNames,
  UploadSemanticStyles,
} from '../interface';

import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  Transition,
  watch,
} from 'vue';

import { getTransitionProps } from '@arvin-studio/headless';
import {
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
} from '@arvin-studio/icons';
import { clsx } from '@arvin-studio/kit';

import { getAttrStyleAndClass } from '../../_util/hooks';
import { useComponentBaseConfig } from '../../config-provider/context';
import Progress from '../../progress';
import Tooltip from '../../tooltip';

export interface ListItemProps {
  actionIconRender: (
    customIcon: any,
    callback: () => void,
    prefixCls: string,
    title?: string,
    acceptUploadDisabled?: boolean,
  ) => any;
  classes?: UploadSemanticClassNames;
  downloadIcon?: ((file: UploadFile) => any) | any;
  extra?: ((file: UploadFile) => any) | any;
  file: UploadFile;
  iconRender: (file: UploadFile) => any;
  isImgUrl?: (file: UploadFile) => boolean;
  itemRender?: ItemRender;
  items: UploadFile[];
  listType?: UploadListType;
  locale: UploadLocale;
  onClose: (file: UploadFile) => void;
  onDownload: (file: UploadFile) => void;
  onPreview: (file: UploadFile, e?: KeyboardEvent | MouseEvent) => void;
  prefixCls: string;
  previewIcon?: ((file: UploadFile) => any) | any;
  progress?: UploadListProgressProps;
  removeIcon?: ((file: UploadFile) => any) | any;
  showDownloadIcon?: ((file: UploadFile) => boolean) | boolean;
  showPreviewIcon?: ((file: UploadFile) => boolean) | boolean;
  showRemoveIcon?: ((file: UploadFile) => boolean) | boolean;
  styles?: UploadSemanticStyles;
}

const ListItem = defineComponent<
  ListItemProps,
  EmptyEmit,
  string,
  SlotsType<Record<string, never>>
>(
  (props, { attrs }) => {
    const mergedStatus = shallowRef(props.file.status);
    watch(
      () => props.file.status,
      (status) => {
        if (status !== 'removed') {
          mergedStatus.value = status;
        }
      },
    );

    const showProgress = shallowRef(false);
    let progressTimer: null | ReturnType<typeof setTimeout> = null;

    onMounted(() => {
      progressTimer = setTimeout(() => {
        showProgress.value = true;
      }, 300);
    });

    onBeforeUnmount(() => {
      if (!progressTimer) {
        return;
      }

      clearTimeout(progressTimer);
      progressTimer = null;
    });

    const { rootPrefixCls } = useComponentBaseConfig('upload');
    const listType = computed(() => props.listType ?? 'text');

    return () => {
      const {
        prefixCls,
        file,
        items,
        classes,
        styles,
        locale,
        isImgUrl,
        showPreviewIcon,
        showRemoveIcon,
        showDownloadIcon,
        previewIcon: customPreviewIcon,
        removeIcon: customRemoveIcon,
        downloadIcon: customDownloadIcon,
        extra: customExtra,
        iconRender,
        actionIconRender,
        itemRender,
        onPreview,
        onDownload,
        onClose,
        progress: progressProps,
      } = props;

      const iconNode = iconRender(file);
      let icon = <div class={`${prefixCls}-icon`}>{iconNode}</div>;

      if (listType.value.startsWith('picture')) {
        if (
          mergedStatus.value === 'uploading' ||
          (!file.thumbUrl && !file.url)
        ) {
          const uploadingClassName = clsx(`${prefixCls}-list-item-thumbnail`, {
            [`${prefixCls}-list-item-file`]: mergedStatus.value !== 'uploading',
          });
          icon = <div class={uploadingClassName}>{iconNode}</div>;
        } else {
          const isImage = isImgUrl?.(file);
          const thumbnail = isImage ? (
            <img
              alt={file.name}
              class={`${prefixCls}-list-item-image`}
              crossorigin={file.crossorigin}
              src={file.thumbUrl || file.url}
            />
          ) : (
            iconNode
          );
          const aClassName = clsx(`${prefixCls}-list-item-thumbnail`, {
            [`${prefixCls}-list-item-file`]: isImgUrl && !isImage,
          });
          icon = (
            <a
              class={aClassName}
              href={file.url || file.thumbUrl}
              onClick={(e) => onPreview(file, e)}
              rel="noopener noreferrer"
              target="_blank"
            >
              {thumbnail}
            </a>
          );
        }
      }

      const listItemClassName = clsx(
        `${prefixCls}-list-item`,
        `${prefixCls}-list-item-${mergedStatus.value}`,
        classes?.item,
      );

      let linkProps = file.linkProps;
      if (typeof linkProps === 'string') {
        try {
          linkProps = JSON.parse(linkProps);
        } catch {
          linkProps = {};
        }
      }

      const removeIcon = (
        typeof showRemoveIcon === 'function'
          ? showRemoveIcon(file)
          : showRemoveIcon
      )
        ? actionIconRender(
            (typeof customRemoveIcon === 'function'
              ? customRemoveIcon(file)
              : customRemoveIcon) || <DeleteOutlined />,
            () => onClose(file),
            prefixCls,
            locale.removeFile,
            true,
          )
        : null;

      const downloadIcon =
        (typeof showDownloadIcon === 'function'
          ? showDownloadIcon(file)
          : showDownloadIcon) && mergedStatus.value === 'done'
          ? actionIconRender(
              (typeof customDownloadIcon === 'function'
                ? customDownloadIcon(file)
                : customDownloadIcon) || <DownloadOutlined />,
              () => onDownload(file),
              prefixCls,
              locale.downloadFile,
            )
          : null;

      const downloadOrDelete = listType.value !== 'picture-card' &&
        listType.value !== 'picture-circle' && (
          <span
            class={clsx(`${prefixCls}-list-item-actions`, {
              picture: listType.value === 'picture',
            })}
            key="download-delete"
          >
            {downloadIcon}
            {removeIcon}
          </span>
        );

      const extraContent =
        typeof customExtra === 'function' ? customExtra(file) : customExtra;
      const extra = extraContent && (
        <span class={`${prefixCls}-list-item-extra`}>{extraContent}</span>
      );

      const listItemNameClass = clsx(`${prefixCls}-list-item-name`);
      // ant-design #58092: make the non-link file name keyboard-accessible.
      const onPreviewKeyDown = (e: KeyboardEvent) => {
        if (!(e.key === 'Enter' || e.key === ' ')) {
          return;
        }

        e.preventDefault();
        onPreview(file, e);
      };
      const fileName = file.url ? (
        <a
          class={listItemNameClass}
          key="view"
          rel="noopener noreferrer"
          target="_blank"
          title={file.name}
          {...linkProps}
          href={file.url}
          onClick={(e) => onPreview(file, e)}
        >
          {file.name}
          {extra}
        </a>
      ) : (
        <span
          class={listItemNameClass}
          key="view"
          onClick={(e) => onPreview(file, e)}
          onKeydown={onPreviewKeyDown}
          role="button"
          tabindex={0}
          title={file.name}
        >
          {file.name}
          {extra}
        </span>
      );

      const previewIcon =
        (typeof showPreviewIcon === 'function'
          ? showPreviewIcon(file)
          : showPreviewIcon) &&
        (file.url || file.thumbUrl) ? (
          <a
            href={file.url || file.thumbUrl}
            onClick={(e) => onPreview(file, e)}
            rel="noopener noreferrer"
            target="_blank"
            title={locale.previewFile}
          >
            {typeof customPreviewIcon === 'function'
              ? customPreviewIcon(file)
              : customPreviewIcon || <EyeOutlined />}
          </a>
        ) : null;

      const pictureCardActions = (listType.value === 'picture-card' ||
        listType.value === 'picture-circle') &&
        mergedStatus.value !== 'uploading' && (
          <span class={`${prefixCls}-list-item-actions`}>
            {previewIcon}
            {mergedStatus.value === 'done' && downloadIcon}
            {removeIcon}
          </span>
        );

      const dom = (
        <div class={listItemClassName} style={styles?.item}>
          {icon}
          {fileName}
          {downloadOrDelete}
          {pictureCardActions}
          {showProgress.value && (
            <Transition
              {...getTransitionProps(`${rootPrefixCls.value}-fade`)}
              appear
            >
              {mergedStatus.value === 'uploading' ? (
                <div class={`${prefixCls}-list-item-progress`}>
                  {'percent' in file ? (
                    <Progress
                      aria-label={file['aria-label']}
                      aria-labelledby={file['aria-labelledby']}
                      percent={file.percent}
                      type="line"
                      {...progressProps}
                    />
                  ) : null}
                </div>
              ) : null}
            </Transition>
          )}
        </div>
      );

      const message =
        typeof file.response === 'string'
          ? file.response
          : file.error?.statusText || file.error?.message || locale.uploadError;
      const item =
        mergedStatus.value === 'error' ? (
          <Tooltip
            getPopupContainer={(node) => node.parentNode as HTMLElement}
            title={message}
          >
            {dom}
          </Tooltip>
        ) : (
          dom
        );

      const { className, style, restAttrs } = getAttrStyleAndClass(attrs);

      return (
        <div
          {...restAttrs}
          class={clsx(`${prefixCls}-list-item-container`, className)}
          style={style}
        >
          {itemRender
            ? itemRender(item, file, items, {
                download: () => onDownload(file),
                preview: () => onPreview(file),
                remove: () => onClose(file),
              })
            : item}
        </div>
      );
    };
  },
  {
    name: 'UploadListItem',
    inheritAttrs: false,
  },
);

export default ListItem;
