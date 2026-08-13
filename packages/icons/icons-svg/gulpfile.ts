import { parallel, series } from 'gulp';
import { clean, copy } from './task';
import { generateIcons } from './task/generateIcons';
import { generalConfig } from './plugins/svgo/presets';
import { assignAttrsAtTag } from './plugins/svg2Definition/creator';
import { adjustViewBox } from './plugins/svg2Definition/presets/adjustViewBox';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { getIdentifier } from './utils';
import { generateEntry } from './task/generateEntry';
import { ExtractRegExp, generateInline } from './task/generateInline';
import { IconDefinition } from './templates/types';

const iconTemplate = readFileSync(
  resolve(__dirname, './templates/icon.ts.ejs'),
  'utf8',
);

export default series(
  // 清理数据
  clean(['src', 'inline-svg', 'es', 'lib']),

  parallel(
    // 复制模板文件
    copy({
      from: ['templates/*.ts'],
      toDir: 'src',
    }),
    // 2.2 generate abstract node with the theme "filled"
    generateIcons({
      theme: 'filled',
      from: ['svg/filled/*.svg'],
      toDir: 'src/asn',
      svgoConfig: generalConfig,
      extraNodeTransformFactories: [
        assignAttrsAtTag('svg', { focusable: 'false' }),
        adjustViewBox,
      ],
      stringify: JSON.stringify,
      template: iconTemplate,
      mapToInterpolate: ({ name, content }) => ({
        identifier: getIdentifier({ name, themeSuffix: 'Filled' }),
        content,
      }),
      filename: ({ name }) => getIdentifier({ name, themeSuffix: 'Filled' }),
    }),

    // 2.2 generate abstract node with the theme "outlined"
    generateIcons({
      theme: 'outlined',
      from: ['svg/outlined/*.svg'],
      toDir: 'src/asn',
      svgoConfig: generalConfig,
      extraNodeTransformFactories: [
        assignAttrsAtTag('svg', { focusable: 'false' }),
        adjustViewBox,
      ],
      stringify: JSON.stringify,
      template: iconTemplate,
      mapToInterpolate: ({ name, content }) => ({
        identifier: getIdentifier({ name, themeSuffix: 'Outlined' }),
        content,
      }),
      filename: ({ name }) => getIdentifier({ name, themeSuffix: 'Outlined' }),
    }),
  ),
  parallel(
    // 3.1 generate entry file: src/index.ts
    generateEntry({
      entryName: 'index.ts',
      from: ['src/asn/*.ts'],
      toDir: 'src',
      banner: '// This index.ts file is generated automatically.\n',
      template: `export { default as <%= identifier %> } from '<%= path %>';`,
      mapToInterpolate: ({ name: identifier }) => ({
        identifier,
        path: `./asn/${identifier}`,
      }),
    }),
    // 3.2 generate inline SVG files
    generateInline({
      from: ['src/asn/*.ts'],
      toDir: ({ _meta }) => `inline-svg/${_meta && _meta.theme}`,
      getIconDefinitionFromSource: (content: string): IconDefinition => {
        const extract = ExtractRegExp.exec(content);
        if (extract === null || !extract[1]) {
          throw new Error('Failed to parse raw icon definition: ' + content);
        }
        return new Function(`return ${extract[1]}`)() as IconDefinition;
      },
    }),
    // 3.3 generate inline SVG files with namespace
    generateInline({
      from: ['src/asn/*.ts'],
      toDir: ({ _meta }) => `inline-namespaced-svg/${_meta && _meta.theme}`,
      getIconDefinitionFromSource: (content: string): IconDefinition => {
        const extract = ExtractRegExp.exec(content);
        if (extract === null || !extract[1]) {
          throw new Error('Failed to parse raw icon definition: ' + content);
        }
        return new Function(`return ${extract[1]}`)() as IconDefinition;
      },
      renderOptions: {
        extraSVGAttrs: { xmlns: 'http://www.w3.org/2000/svg' },
      },
    }),
  ),
);
