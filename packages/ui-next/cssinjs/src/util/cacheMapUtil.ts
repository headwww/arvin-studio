import { canUseDom } from '@arvin-studio/headless';

import { ATTR_MARK } from '../StyleContext';

export const ATTR_CACHE_MAP = 'data-as-cssinjs-cache-path';

/**
 * This marks style from the css file.
 * Which means not exist in `<style />` tag.
 */
export const CSS_FILE_STYLE = '_FILE_STYLE__';

export function serialize(cachePathMap: Record<string, string>) {
  return Object.entries(cachePathMap)
    .map(([path, value]) => {
      const hash = value;
      return `${path}:${hash}`;
    })
    .join(';');
}

let cachePathMap: Record<string, string>;
let fromCSSFile = true;

/**
 * @private Test usage only. Can save remove if no need.
 */
export function reset(mockCache?: Record<string, string>, fromFile = true) {
  cachePathMap = mockCache!;
  fromCSSFile = fromFile;
}

export function prepare() {
  if (cachePathMap) {
    return;
  }

  cachePathMap = {};

  if (canUseDom()) {
    const div = document.createElement('div');
    div.className = ATTR_CACHE_MAP;
    div.style.position = 'fixed';
    div.style.visibility = 'hidden';
    div.style.top = '-9999px';
    document.body.append(div);

    let content = getComputedStyle(div).content || '';
    content = content.replace(/^"/, '').replace(/"$/, '');

    // Fill data
    content.split(';').forEach((item) => {
      const [path, hash] = item.split(':', 2);
      (cachePathMap as any)[path!] = hash;
    });

    // Remove inline record style
    const inlineMapStyle = document.querySelector(
      `style[${CSS.escape(ATTR_CACHE_MAP)}]`,
    );
    if (inlineMapStyle) {
      fromCSSFile = false;
      inlineMapStyle.remove();
    }

    div.remove();
  }
}

export function existPath(path: string) {
  prepare();

  return !!cachePathMap[path];
}

export function getStyleAndHash(
  path: string,
): [style: null | string, hash: string] {
  const hash = cachePathMap[path];
  let styleStr: null | string = null;

  if (hash && canUseDom()) {
    if (fromCSSFile) {
      styleStr = CSS_FILE_STYLE;
    } else {
      const style = document.querySelector(
        `style[${CSS.escape(ATTR_MARK)}="${CSS.escape(cachePathMap[path]!)}"]`,
      );

      if (style) {
        styleStr = style.getHTML();
      } else {
        // Clean up since not exist anymore
        delete cachePathMap[path];
      }
    }
  }

  return [styleStr, hash!];
}
