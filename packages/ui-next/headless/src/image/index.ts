import Image from './Image';
import PreviewGroup from './PreviewGroup';

export * from './Image';

// eslint-disable-next-line unicorn/no-useless-re-export
export { type ImageProps } from './Image';
export { PreviewGroup };

type ImageType = typeof Image & {
  PreviewGroup: typeof PreviewGroup;
};

const ExportImage = Image as ImageType;
ExportImage.PreviewGroup = PreviewGroup;

export default ExportImage;

export type { PreviewGroupProps } from './PreviewGroup';
