import type { App } from 'vue';

import Link from './Link';
import Paragraph from './Paragraph';
import Text from './Text';
import Title from './Title';
import OriginTypography from './Typography';

export type { BlockProps } from './interface';
export type { LinkProps } from './Link';
export type { ParagraphProps } from './Paragraph';
export type { TextProps } from './Text';
export type { TitleProps } from './Title';

export const TypographyText = Text;
export const TypographyLink = Link;
export const TypographyTitle = Title;
export const TypographyParagraph = Paragraph;

const Typography = OriginTypography as typeof OriginTypography & {
  Link: typeof Link;
  Paragraph: typeof Paragraph;
  Text: typeof Text;
  Title: typeof Title;
};

Typography.Text = Text;
Typography.Link = Link;
Typography.Title = Title;
Typography.Paragraph = Paragraph;

(Typography as any).install = (app: App) => {
  app.component((Typography as any).name, Typography);
  app.component((Text as any).name, Text);
  app.component((Link as any).name, Link);
  app.component((Title as any).name, Title);
  app.component((Paragraph as any).name, Paragraph);
};

export default Typography;
