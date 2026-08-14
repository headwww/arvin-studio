import type { AbstractNode } from '@arvin-studio/icons-svg/lib/types';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// @ts-ignore
import { JSDOM } from 'jsdom';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SVG_DIR = path.resolve(__dirname, '../src/svgs');
const OUT_DIR = path.resolve(__dirname, '../src/extra-icons');

const THEMES = ['Outlined', 'Filled', 'TwoTone'] as const;

const SVG_EXT_RE = /\.svg$/;
const KEBAB_RE_1 = /([a-z0-9])([A-Z])/g;
const KEBAB_RE_2 = /([A-Z]+)([A-Z][a-z])/g;

// 这些标签整体丢弃（currentColor 模式下渐变/裁剪无意义）
const STRIP_TAGS = new Set(['defs', 'title', 'desc', 'metadata']);
// 这些属性在所有节点上丢弃，使图形回落到 currentColor
const DROP_ATTRS = new Set([
  'class',
  'fill',
  'fill-opacity',
  'clip-path',
  'style',
  'id',
  'version',
  'xmlns',
  'xmlns:xlink',
  'width',
  'height',
]);

interface ParsedName {
  svgIdentifier: string;
  name: string;
  theme: 'outlined' | 'filled' | 'twotone';
}

function parseName(fileName: string): ParsedName {
  const svgIdentifier = fileName.replace(SVG_EXT_RE, '');
  let theme: ParsedName['theme'] = 'outlined';
  let base = svgIdentifier;
  for (const t of THEMES) {
    if (svgIdentifier.endsWith(t)) {
      theme = t.toLowerCase() as ParsedName['theme'];
      base = svgIdentifier.slice(0, -t.length);
      break;
    }
  }
  const name = base
    .replace(KEBAB_RE_1, '$1-$2')
    .replace(KEBAB_RE_2, '$1-$2')
    .toLowerCase();
  return { svgIdentifier, name, theme };
}
function element2AbstractNode(
  // @ts-ignore
  el: Element,
  isRoot: boolean,
): AbstractNode | null {
  const tag = el.tagName;
  if (STRIP_TAGS.has(tag)) return null;

  const attrs: Record<string, string> = {};
  if (isRoot) {
    const viewBox = el.getAttribute('viewBox');
    if (viewBox) attrs.viewBox = viewBox;
    attrs.focusable = 'false';
  } else {
    for (const attr of Array.from(el.attributes)) {
      // @ts-ignore
      if (DROP_ATTRS.has(attr.name)) continue;
      // @ts-ignore
      attrs[attr.name] = attr.value;
    }
  }

  const children: AbstractNode[] = [];
  for (const child of Array.from(el.children)) {
    const node = element2AbstractNode(child, false);
    if (node) children.push(node);
  }

  const node: AbstractNode = { tag, attrs };
  if (children.length) node.children = children;
  return node;
}

function svg2Definition(svg: string, { name, theme }: ParsedName) {
  const dom = new JSDOM('', { contentType: 'text/html' });
  const doc = new dom.window.DOMParser().parseFromString(svg, 'image/svg+xml');
  const root = doc.querySelector('svg');
  if (!root) throw new Error('No <svg> root element found');

  const icon = element2AbstractNode(root, true);
  return { icon, name, theme };
}

function render({ svgIdentifier }: ParsedName, definition: unknown): string {
  return `// GENERATE BY ./scripts/gen-custom-icons.ts
// DO NOT EDIT IT MANUALLY

import type { IconDefinition } from '@arvin-studio/icons-svg/lib/types'
import type { AsIconProps } from '../components/AsIcon'
import { defineComponent } from 'vue'
import AsIcon from '../components/AsIcon'

const ${svgIdentifier}Svg: IconDefinition = ${JSON.stringify(definition)}

const ${svgIdentifier} = defineComponent<AsIconProps>(
  (props) => {
    return () => {
      return <AsIcon {...props} icon={${svgIdentifier}Svg} />
    }
  },
  {
    name: '${svgIdentifier}',
  },
)

export default ${svgIdentifier}
`;
}

async function generate() {
  if (!fs.existsSync(SVG_DIR)) {
    console.warn(`No svg source dir: ${SVG_DIR}`);
    return;
  }
  await fsp.mkdir(OUT_DIR, { recursive: true });

  const files = (await fsp.readdir(SVG_DIR))
    .filter((f) => f.endsWith('.svg'))
    .sort();

  const identifiers: string[] = [];
  for (const file of files) {
    const parsed = parseName(file);
    const svg = await fsp.readFile(path.join(SVG_DIR, file), 'utf-8');
    const definition = svg2Definition(svg, parsed);
    await fsp.writeFile(
      path.join(OUT_DIR, `${parsed.svgIdentifier}.tsx`),
      render(parsed, definition),
    );
    identifiers.push(parsed.svgIdentifier);
  }

  const entry = identifiers
    .sort()
    .map((id) => `export { default as ${id} } from './${id}';`)
    .join('\n');
  await fsp.writeFile(path.join(OUT_DIR, 'index.tsx'), `${entry}\n`);

  console.log(`Generate ${identifiers.length} custom icon(s) successfully.`);
}

generate();
