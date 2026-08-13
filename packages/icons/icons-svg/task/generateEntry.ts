import { dest, src } from 'gulp';
import concat from 'gulp-concat';
import header from 'gulp-header';

import { useTemplate, UseTemplatePluginOptions } from '../plugins';

export interface GenerateEntryOptions extends UseTemplatePluginOptions {
  banner?: string;
  entryName: string;
  from: string[];
  toDir: string;
}

export const generateEntry = ({
  from,
  toDir,
  template,
  mapToInterpolate,
  entryName,
  banner = '',
}: GenerateEntryOptions) =>
  function GenerateEntry() {
    return src(from)
      .pipe(
        useTemplate({
          template,
          mapToInterpolate,
        }),
      )
      .pipe(concat(entryName))
      .pipe(header(banner))
      .pipe(dest(toDir));
  };
