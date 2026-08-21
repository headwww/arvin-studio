/**
 * Used for PreviewGroup passed image data
 */
export type ImageElementProps = Pick<
  HTMLImageElement,
  | 'alt'
  | 'crossOrigin'
  | 'decoding'
  | 'draggable'
  | 'fetchPriority'
  | 'loading'
  | 'referrerPolicy'
  | 'sizes'
  | 'src'
  | 'srcset'
  | 'useMap'
>;

export interface PreviewImageElementProps {
  canPreview: boolean;
  data: ImageElementProps;
}

export type InternalItem = PreviewImageElementProps & {
  id?: string;
};

export type RegisterImage = (
  id: string,
  data: PreviewImageElementProps,
) => VoidFunction;

export type OnGroupPreview = (
  id: string,
  imageSrc: string,
  mouseX: number,
  mouseY: number,
) => void;
