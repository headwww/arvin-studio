import { dest, src } from 'gulp';
import rename from 'gulp-rename';
import SVGO from 'svgo';

import {
  svg2Definition,
  SVG2DefinitionOptions,
  svgo,
  useTemplate,
  UseTemplatePluginOptions,
} from '../plugins';

export interface GenerateIconsOptions
  extends SVG2DefinitionOptions, UseTemplatePluginOptions {
  filename: (option: { name: string }) => string;
  from: string[];
  svgoConfig: SVGO.Config;
  toDir: string;
}

export const generateIcons = ({
  from,
  toDir,
  svgoConfig,
  theme,
  extraNodeTransformFactories,
  stringify,
  template,
  mapToInterpolate,
  filename,
}: GenerateIconsOptions) => {
  return function GenerateIcons() {
    return src(from)
      .pipe(svgo(svgoConfig))
      .pipe(
        svg2Definition({
          theme,
          extraNodeTransformFactories,
          stringify,
        }),
      )
      .pipe(useTemplate({ template, mapToInterpolate }))
      .pipe(
        rename((file) => {
          if (!file.basename) {
            return;
          }

          file.basename = filename({ name: file.basename });
          file.extname = '.ts';
        }),
      )
      .pipe(dest(toDir));
  };
};
