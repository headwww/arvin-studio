export interface AutoSizeType {
  maxRows?: number;
  minRows?: number;
}

export interface TextAreaProps {
  autoSize?: AutoSizeType | boolean;
}
