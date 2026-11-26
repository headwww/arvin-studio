import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createSSRApp, Fragment, h } from 'vue';

import {
  createCache,
  extractStyle,
  StyleProvider,
} from '@arvin-studio/cssinjs';
// oxlint-disable no-unused-vars
import * as _as_ui from '@arvin-studio/ui/components';

import { renderToString } from 'vue/server-renderer';

const as_ui = (_as_ui as any).components_exports ?? _as_ui;

const blackList = new Set(['ConfigProvider', 'Grid']);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distOutput = path.resolve(__dirname, '../../dist/as_ui.css');

const ComponentCustomizeRender: Record<string, RenderFn> = {
  Affix: (Affix) => h(Affix, null, { default: () => h('div') }),
  BackTop: (BackTop) => h(BackTop),
  Cascader: (Cascader) =>
    h(Fragment, null, [
      h(Cascader, { options: [] }),
      as_ui.CascaderPanel ? h(as_ui.CascaderPanel, { options: [] }) : null,
    ]),
  Dropdown: (Dropdown) =>
    h(Dropdown, { menu: { items: [] } }, { default: () => h('div') }),
  Menu: (Menu) => h(Menu, { items: [] }),
  QRCode: (QRCode) => h(QRCode, { value: 'langtong' }),
  Tree: (Tree) => h(Tree, { treeData: [] }),
  Tag: (Tag) =>
    h(Fragment, null, [
      h(Tag, { color: 'blue' }, { default: () => 'Tag' }),
      h(Tag, { color: 'success' }, { default: () => 'Tag' }),
    ]),
  Badge: (Badge) =>
    h(Fragment, null, [
      h(Badge),
      (Badge as any).Ribbon
        ? h(
            (Badge as any).Ribbon,
            { text: 'Ribbon' },
            { default: () => h('div') },
          )
        : null,
    ]),
  Space: (Space) =>
    h(Fragment, null, [
      h(Space, null, { default: () => [h(as_ui.Button)] }),
      as_ui.SpaceCompact
        ? h(as_ui.SpaceCompact, null, {
            default: () => [
              h(as_ui.Button),
              as_ui.SpaceAddon
                ? h(as_ui.SpaceAddon, null, { default: () => '1' })
                : null,
            ],
          })
        : null,
    ]),
  Input: (Input) => {
    const Group = (Input as any).Group;
    const Search = (Input as any).Search;
    const TextArea = (Input as any).TextArea;
    const Password = (Input as any).Password;
    const OTP = (Input as any).OTP;

    return h(Fragment, null, [
      h(Input),
      Group ? h(Group, null, { default: () => [h(Input), h(Input)] }) : null,
      Search ? h(Search) : null,
      TextArea ? h(TextArea) : null,
      Password ? h(Password) : null,
      OTP ? h(OTP) : null,
    ]);
  },
  Modal: (Modal) => {
    const PureModal = (Modal as any)._InternalPanelDoNotUseOrYouWillBeFired;
    return h(Fragment, null, [
      h(Modal),
      PureModal ? h(PureModal) : null,
      PureModal ? h(PureModal, { type: 'confirm' }) : null,
    ]);
  },
  message: (message: any) => {
    const PurePanel = message._InternalPanelDoNotUseOrYouWillBeFired;
    return PurePanel ? h(PurePanel) : null;
  },
  notification: (notification: any) => {
    const PurePanel = notification._InternalPanelDoNotUseOrYouWillBeFired;
    return PurePanel ? h(PurePanel) : null;
  },
  Layout: () =>
    h(as_ui.Layout, null, {
      default: () => [
        as_ui.LayoutHeader
          ? h(as_ui.LayoutHeader, null, { default: () => 'Header' })
          : null,
        as_ui.LayoutSider
          ? h(as_ui.LayoutSider, null, { default: () => 'Sider' })
          : null,
        as_ui.LayoutContent
          ? h(as_ui.LayoutContent, null, { default: () => 'Content' })
          : null,
        as_ui.LayoutFooter
          ? h(as_ui.LayoutFooter, null, { default: () => 'Footer' })
          : null,
      ],
    }),
};

function shouldRenderComponent(name: string) {
  if (blackList.has(name)) return false;
  return (
    name[0] === name![0]!.toUpperCase() ||
    name === 'message' ||
    name === 'notification'
  );
}

function isRenderableComponent(name: string, component: any) {
  if (!shouldRenderComponent(name)) return false;
  if (!component) return false;
  if (typeof component === 'function') return true;
  if (typeof component === 'object') {
    return Boolean(
      (component as any).render ||
      (component as any).setup ||
      (component as any).__asyncLoader,
    );
  }
  return false;
}

function normalizeRender(node: RenderNode): ReturnType<typeof h>[] {
  if (!node) return [];
  return Array.isArray(node)
    ? (node.filter(Boolean) as ReturnType<typeof h>[])
    : [node];
}

const notHas = new Set([
  'AutoCompleteOption',
  // 'AvatarGroup',
  // 'BadgeRibbon',
  // 'CardGrid',
  // 'CardMeta',
  // 'CascaderPanel',
  // 'CheckboxGroup',
  // 'Color',
  // 'DateMonthPicker',
  // 'DateQuarterPicker',
  // 'DateRangePicker',
  // 'DateWeekPicker',
  // 'DateYearPicker',
  // 'BackTop',
  // 'FloatButtonGroup',
  // 'FormItem',
  // 'Col',
  // 'Row',
  // 'ImagePreviewGroup',
  // 'InputGroup',
  // 'InputOTP',
  // 'InputPassword',
  // 'InputSearch',
  // 'TextArea',
  // 'LayoutContent',
  // 'LayoutFooter',
  // 'LayoutHeader',
  // 'LayoutSider',
  // 'useLayoutSider',
  // 'MentionsOption',
  // 'MenuDivider',
  // 'MenuItem',
  // 'SubMenu',
  // 'useMessage',
  // 'useModal',
  // 'useNotification',
  // 'Progress',
  // 'RadioButton',
  // 'RadioGroup',
  // 'Segmented',
  // 'SelectOptGroup',
  // 'SelectOption',
  // 'SkeletonAvatar',
  // 'SkeletonButton',
  // 'SkeletonImage',
  // 'SkeletonInput',
  // 'SkeletonNode',
  // 'SpaceAddon',
  // 'SpaceCompact',
  // 'SplitterPanel',
  // 'StatisticTimer',
  // 'TableColumn',
  // 'TableColumnGroup',
  // 'TableSummary',
  // 'TableSummaryCell',
  // 'TableSummaryRow',
  // 'TabPane',
  // 'CheckableTag',
  // 'CheckableTagGroup',
  // 'TimeRangePicker',
  // 'TypographyLink',
  // 'TypographyParagraph',
  // 'TypographyText',
  // 'TypographyTitle',
  // 'UploadDragger',
  // 'DirectoryTree',
  'UniqueProvider',
]);

function defaultNode() {
  const nodes = Object.keys(as_ui)
    .filter((name) => {
      return !notHas.has(name);
    })
    .filter(
      (name) =>
        isRenderableComponent(name, (as_ui as any)[name]) ||
        ComponentCustomizeRender[name],
    )
    .map((compName) => {
      const Comp = (as_ui as any)[compName];
      const renderFunc = ComponentCustomizeRender[compName];
      const rendered = renderFunc ? renderFunc(Comp) : h(Comp);
      return h(Fragment, { key: compName }, normalizeRender(rendered));
    });

  return h(Fragment, null, nodes);
}

async function extractStyleText(
  customTheme?: (node: ReturnType<typeof h>) => ReturnType<typeof h>,
) {
  const cache = createCache();
  const ConfigProvider = (as_ui as any).ConfigProvider || Fragment;
  const app = createSSRApp({
    render: () =>
      h(
        ConfigProvider,
        { theme: { hashed: false } },
        {
          default: () =>
            h(
              StyleProvider,
              { cache, mock: 'server' },
              {
                default: () =>
                  customTheme ? customTheme(defaultNode()) : defaultNode(),
              },
            ),
        },
      ),
  });
  await renderToString(app);
  return extractStyle(cache, { plain: true, types: 'style' });
}

export async function buildStyle() {
  const styleText = await extractStyleText();
  for (const output of [distOutput]) {
    await fs.mkdir(path.dirname(output), { recursive: true });
    await fs.rm(output, { force: true });
    await fs.writeFile(output, styleText);
  }
  // oxlint-disable-next-line no-console
  console.log(`Style output saved to: ${distOutput}`);
}
