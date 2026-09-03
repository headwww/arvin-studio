import {
  LeftOutlined,
  LoadingOutlined,
  RightOutlined,
} from '@arvin-studio/icons';

const defaultLoadingIcon = <LoadingOutlined spin />;
const defaultExpandIcon = <RightOutlined />;
const defaultRtlExpandIcon = <LeftOutlined />;

export interface UseIconsOptions {
  contextExpandIcon: any | undefined;
  contextLoadingIcon: any | undefined;
  expandIcon: any | undefined;
  isRtl: boolean;
  loadingIcon: any | undefined;
}

export default function useIcons({
  contextExpandIcon,
  contextLoadingIcon,
  expandIcon,
  loadingIcon,
  isRtl,
}: UseIconsOptions) {
  return {
    expandIcon:
      expandIcon ??
      contextExpandIcon ??
      (isRtl ? defaultRtlExpandIcon : defaultExpandIcon),
    loadingIcon: loadingIcon ?? contextLoadingIcon ?? defaultLoadingIcon,
  };
}
