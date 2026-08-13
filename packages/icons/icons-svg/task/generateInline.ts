import { dest, src } from 'gulp';
import * as File from 'vinyl';

import { RenderCustomData, useRender } from '../plugins/render';
import { HelperRenderOptions } from '../templates/helpers';
import { IconDefinition } from '../templates/types';

export interface GenerateInlineOptions {
  from: string[];
  getIconDefinitionFromSource: (raw: string) => IconDefinition;
  renderOptions?: HelperRenderOptions;
  toDir: (file: File & { _renderData?: RenderCustomData }) => string;
}

export const ExtractRegExp = /({\s*".*});/;

export const generateInline = ({
  from,
  toDir,
  getIconDefinitionFromSource,
  renderOptions = {},
}: GenerateInlineOptions) =>
  function GenerateInline() {
    return src(from)
      .pipe(
        useRender({
          getIconDefinitionFromSource,
          renderOptions,
        }),
      )
      .pipe(dest(toDir as any));
  };
