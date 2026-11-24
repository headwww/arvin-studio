<script setup lang="ts">
/**
 * Dropdown 下拉菜单的交互测试页。
 * 覆盖：触发方式 / 弹层位置 / 箭头 / 受控 open / 自定义弹层 /
 * 语义化 classes & styles / 可多选菜单 / 事件回调。
 */
import type { DropdownProps, MenuItemType } from '@arvin-studio/ui';

import { computed, h, ref } from 'vue';

import {
  AppstoreOutlined,
  DownOutlined,
  LogoutOutlined,
  MailOutlined,
  SettingOutlined,
  UserOutlined,
} from '@arvin-studio/icons';
import {
  Button,
  Dropdown,
  Segmented,
  Space,
  Switch,
  Tag,
} from '@arvin-studio/ui';

type Placement = NonNullable<DropdownProps['placement']>;

// ---------------------------------------------------------------- 菜单数据
const userItems: MenuItemType[] = [
  { key: 'profile', label: '个人中心', icon: UserOutlined },
  { key: 'settings', label: '账号设置', icon: SettingOutlined },
  { type: 'divider', key: 'user-divider' },
  { key: 'logout', label: '退出登录', icon: LogoutOutlined, danger: true },
];

const basicItems: MenuItemType[] = [
  { key: 'mail', label: '邮件', icon: MailOutlined },
  { key: 'app', label: '应用', icon: AppstoreOutlined },
  { key: 'disabled-item', label: '禁用项', disabled: true },
  {
    key: 'sub',
    label: '更多操作',
    icon: SettingOutlined,
    children: [
      { key: 'sub:1', label: '子项一' },
      { key: 'sub:2', label: '子项二' },
      { key: 'sub:3', label: '子项三' },
    ],
  },
  { type: 'divider', key: 'basic-divider' },
  { key: 'delete', label: '删除', danger: true },
];

const simpleItems: MenuItemType[] = [
  { key: '1', label: '菜单项一' },
  { key: '2', label: '菜单项二' },
  { key: '3', label: '菜单项三', disabled: true },
];

const contextItems: MenuItemType[] = [
  { key: 'copy', label: '复制' },
  { key: 'rename', label: '重命名' },
  { type: 'divider', key: 'context-divider' },
  { key: 'context-delete', label: '删除', danger: true },
];

const semanticItems: MenuItemType[] = [
  { key: 's1', label: '高亮菜单项', icon: AppstoreOutlined },
  { key: 's2', label: '普通菜单项', icon: SettingOutlined },
];

// ---------------------------------------------------------------- 事件日志
interface DemoLog {
  detail: string;
  id: number;
  time: string;
  type: string;
}

const logs = ref<DemoLog[]>([]);
const lastClick = ref('');
let logSeq = 0;

function pushLog(type: string, detail: string) {
  logSeq += 1;
  logs.value = [
    {
      id: logSeq,
      time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
      type,
      detail,
    },
    ...logs.value,
  ].slice(0, 10);
}

function onMenuClick(info: any) {
  lastClick.value = String(info?.key ?? '');
  pushLog('menuClick', `key=${lastClick.value}`);
}

function onOpenChange(open: boolean, info: { source: string }) {
  pushLog('openChange', `open=${open} · source=${info?.source ?? '-'}`);
}

// ---------------------------------------------------------------- 位置 / 箭头
const placementOptions = [
  'bottomLeft',
  'bottom',
  'bottomRight',
  'topLeft',
  'top',
  'topRight',
  'left',
  'right',
].map((value) => ({ label: value, value }));

const placement = ref<Placement>('bottomLeft');
const arrowEnabled = ref(true);
const pointAtCenter = ref(true);

const arrowValue = computed(() => {
  if (!arrowEnabled.value) {
    return false;
  }
  return pointAtCenter.value ? { pointAtCenter: true } : true;
});

// ---------------------------------------------------------------- 受控 open
const controlledOpen = ref(false);
const destroyOnHidden = ref(false);

// ---------------------------------------------------------------- 自定义弹层
const customOpen = ref(false);
const renderOpen = ref(false);

function renderPopup() {
  return h('div', { class: 'demo-dropdown-panel' }, [
    h('div', { class: 'demo-dropdown-panel-title' }, 'popupRender 渲染函数'),
    h('p', '用 popupRender prop 传入渲染函数，弹层里可以放任意节点。'),
    h(
      Button,
      {
        size: 'small',
        type: 'primary',
        onClick: () => {
          renderOpen.value = false;
        },
      },
      () => '关闭弹层',
    ),
  ]);
}

// ---------------------------------------------------------------- 多选菜单
const selectedKeys = ref<string[]>(['m1']);

const multiItems: MenuItemType[] = [
  { key: 'm1', label: '选项 A' },
  { key: 'm2', label: '选项 B' },
  { key: 'm3', label: '选项 C' },
];

const multiMenu = computed(() => ({
  items: multiItems,
  selectable: true,
  multiple: true,
  selectedKeys: selectedKeys.value,
  'onUpdate:selectedKeys': (keys: string[]) => {
    selectedKeys.value = keys;
    pushLog('selectedKeys', `[${keys.join(', ')}]`);
  },
}));

function clearSelectedKeys() {
  selectedKeys.value = [];
}
</script>

<template>
  <section class="demo-dropdown">
    <h3>交互测试</h3>
    <p class="demo-dropdown-intro">
      交互测试页：切换触发方式、位置、箭头开关，观察受控 open 与多选菜单的行为，
      所有事件都会记录到页面底部的日志里。
    </p>

    <!-- 1. 基础用法 -->
    <h4>1. 基础用法</h4>
    <div class="demo-dropdown-block">
      <Space wrap align="center">
        <Dropdown
          :trigger="['click']"
          arrow
          :menu="{ items: userItems }"
          @menu-click="onMenuClick"
          @open-change="onOpenChange"
        >
          <Button class="demo-dropdown-basic-trigger">
            个人菜单
            <DownOutlined />
          </Button>
        </Dropdown>

        <Dropdown
          :trigger="['click']"
          :menu="{ items: basicItems }"
          @menu-click="onMenuClick"
          @open-change="onOpenChange"
        >
          <Button>图标 / 禁用项 / 子菜单 / danger</Button>
        </Dropdown>

        <Tag v-if="lastClick" color="green">最近点击：{{ lastClick }}</Tag>
      </Space>
      <p class="demo-dropdown-hint">
        菜单项支持 icon、disabled、danger、divider 与 children 子菜单。
      </p>
    </div>

    <!-- 2. 触发方式 -->
    <h4>2. 触发方式</h4>
    <div class="demo-dropdown-grid">
      <div class="demo-dropdown-block">
        <span class="demo-dropdown-label">hover（延迟 0.3s / 0.2s）</span>
        <Dropdown
          :trigger="['hover']"
          :mouse-enter-delay="0.3"
          :mouse-leave-delay="0.2"
          :menu="{ items: simpleItems }"
          @open-change="onOpenChange"
        >
          <Button class="demo-dropdown-hover-trigger">悬停触发</Button>
        </Dropdown>
      </div>

      <div class="demo-dropdown-block">
        <span class="demo-dropdown-label">click</span>
        <Dropdown
          :trigger="['click']"
          :menu="{ items: simpleItems }"
          @open-change="onOpenChange"
        >
          <Button class="demo-dropdown-click-trigger">点击触发</Button>
        </Dropdown>
      </div>

      <div class="demo-dropdown-block">
        <span class="demo-dropdown-label">contextmenu</span>
        <Dropdown
          :trigger="['contextmenu']"
          :menu="{ items: contextItems }"
          @menu-click="onMenuClick"
          @open-change="onOpenChange"
        >
          <div class="demo-dropdown-context-area">在此区域点击右键</div>
        </Dropdown>
      </div>

      <div class="demo-dropdown-block">
        <span class="demo-dropdown-label">disabled</span>
        <Dropdown disabled :menu="{ items: simpleItems }">
          <Button>禁用状态</Button>
        </Dropdown>
      </div>
    </div>

    <!-- 3. 位置与箭头 -->
    <h4>3. 弹层位置与箭头</h4>
    <div class="demo-dropdown-block">
      <Space wrap align="center">
        <Segmented v-model:value="placement" :options="placementOptions" />
        <span class="demo-dropdown-label">
          箭头
          <Switch v-model:checked="arrowEnabled" size="small" />
        </span>
        <span class="demo-dropdown-label">
          箭头居中
          <Switch
            v-model:checked="pointAtCenter"
            size="small"
            :disabled="!arrowEnabled"
          />
        </span>
        <Dropdown
          :placement="placement"
          :arrow="arrowValue"
          :trigger="['click']"
          :menu="{ items: simpleItems }"
          @open-change="onOpenChange"
        >
          <Button class="demo-dropdown-placement-trigger">
            placement: {{ placement }}
          </Button>
        </Dropdown>
      </Space>
      <p class="demo-dropdown-hint">
        当前 arrow 值：<code>{{ JSON.stringify(arrowValue) }}</code>
        ，placement 切换后点击按钮查看弹层落点。
      </p>
    </div>

    <!-- 4. 受控 open -->
    <h4>4. 受控 open 与 destroyOnHidden</h4>
    <div class="demo-dropdown-block">
      <Space wrap align="center">
        <Dropdown
          v-model:open="controlledOpen"
          :classes="{ root: 'demo-controlled-overlay' }"
          :destroy-on-hidden="destroyOnHidden"
          :menu="{ items: userItems }"
          @menu-click="onMenuClick"
          @open-change="onOpenChange"
        >
          <Button class="demo-dropdown-controlled-trigger">受控菜单</Button>
        </Dropdown>
        <Button size="small" @click="controlledOpen = !controlledOpen">
          {{ controlledOpen ? '外部关闭' : '外部打开' }}
        </Button>
        <Tag :color="controlledOpen ? 'green' : 'default'">
          open: {{ controlledOpen }}
        </Tag>
        <span class="demo-dropdown-label">
          destroyOnHidden
          <Switch v-model:checked="destroyOnHidden" size="small" />
        </span>
      </Space>
      <p class="demo-dropdown-hint">
        外部按钮与菜单点击都会走 <code>update:open</code>；打开 destroyOnHidden
        后弹层关闭即销毁，再次打开会重新挂载。
      </p>
    </div>

    <!-- 5. 自定义弹层 -->
    <h4>5. 自定义弹层</h4>
    <div class="demo-dropdown-block">
      <Space wrap align="center">
        <Dropdown
          v-model:open="customOpen"
          :trigger="['click']"
          :destroy-on-hidden="true"
        >
          <Button class="demo-dropdown-custom-trigger">
            自定义弹层（插槽）
          </Button>
          <template #popupRender>
            <div class="demo-dropdown-panel">
              <div class="demo-dropdown-panel-title">自定义内容</div>
              <p>这里不是 Menu，而是任意节点，用来验证 popupRender 插槽。</p>
              <Button size="small" type="primary" @click="customOpen = false">
                知道了
              </Button>
            </div>
          </template>
        </Dropdown>

        <Dropdown
          v-model:open="renderOpen"
          :trigger="['click']"
          :popup-render="renderPopup"
        >
          <Button class="demo-dropdown-render-trigger">
            自定义弹层（渲染函数）
          </Button>
        </Dropdown>
      </Space>
      <p class="demo-dropdown-hint">
        两种写法：<code>#popupRender</code> 插槽与
        <code>:popup-render</code> 函数； 不传 menu 时弹层完全由外部内容决定。
      </p>
    </div>

    <!-- 6. 语义化 classes / styles -->
    <h4>6. 语义化 classes / styles</h4>
    <div class="demo-dropdown-block">
      <Space wrap align="center">
        <Dropdown
          :trigger="['click']"
          :classes="{
            root: 'demo-dropdown-overlay-root',
            item: 'demo-dropdown-overlay-item',
            itemContent: 'demo-dropdown-overlay-item-content',
          }"
          :styles="{ root: { minWidth: '260px' } }"
          :menu="{ items: semanticItems }"
          @menu-click="onMenuClick"
        >
          <Button class="demo-dropdown-semantic-trigger">语义化样式</Button>
        </Dropdown>
      </Space>
      <p class="demo-dropdown-hint">
        root 类名挂到 body 下的弹层根节点（非 scoped 样式才生效）， item /
        itemContent 会透传给内部 Menu。
      </p>
    </div>

    <!-- 7. 多选菜单 -->
    <h4>7. 可多选菜单（不自动关闭）</h4>
    <div class="demo-dropdown-block">
      <Space wrap align="center">
        <Dropdown
          :trigger="['click']"
          :menu="multiMenu"
          @menu-click="onMenuClick"
          @open-change="onOpenChange"
        >
          <Button class="demo-dropdown-multi-trigger">多选菜单</Button>
        </Dropdown>

        <Tag v-for="key in selectedKeys" :key="key" color="blue">{{ key }}</Tag>
        <Button
          size="small"
          :disabled="selectedKeys.length === 0"
          @click="clearSelectedKeys"
        >
          清空选择
        </Button>
      </Space>
      <p class="demo-dropdown-hint">
        menu 上传入 <code>selectable: true</code> +
        <code>multiple: true</code>， 点击菜单项只切换选中状态，弹层保持打开。
      </p>
    </div>

    <!-- 8. 事件日志 -->
    <h4>8. 事件日志</h4>
    <div class="demo-dropdown-log">
      <div class="demo-dropdown-log-head">
        <span>最近 {{ logs.length }} 条事件</span>
        <Button size="small" :disabled="logs.length === 0" @click="logs = []">
          清空
        </Button>
      </div>
      <div v-if="logs.length === 0" class="demo-dropdown-log-empty">
        暂无事件，点开上面的下拉菜单试试。
      </div>
      <ol v-else class="demo-dropdown-log-list">
        <li v-for="log in logs" :key="log.id" class="demo-dropdown-log-row">
          <span class="demo-dropdown-log-time">{{ log.time }}</span>
          <Tag :color="log.type === 'menuClick' ? 'green' : 'blue'">
            {{ log.type }}
          </Tag>
          <code class="demo-dropdown-log-detail">{{ log.detail }}</code>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.demo-dropdown h3 {
  margin: 0 0 8px;
  font-size: 20px;
}

.demo-dropdown h4 {
  margin: 28px 0 12px;
  font-size: 15px;
  color: #1f2329;
}

.demo-dropdown-intro {
  margin: 0 0 8px;
  color: #646a73;
}

.demo-dropdown-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.demo-dropdown-block {
  padding: 16px;
  background: #fff;
  border: 1px solid #e5e6eb;
  border-radius: 10px;
}

.demo-dropdown-grid .demo-dropdown-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
}

.demo-dropdown-label {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  font-size: 13px;
  color: #646a73;
}

.demo-dropdown-hint {
  margin: 10px 0 0;
  font-size: 13px;
  color: #8f959e;
}

.demo-dropdown-context-area {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 64px;
  color: #646a73;
  user-select: none;
  border: 1px dashed #c9cdd4;
  border-radius: 8px;
}

.demo-dropdown-log {
  padding: 16px;
  background: #fff;
  border: 1px solid #e5e6eb;
  border-radius: 10px;
}

.demo-dropdown-log-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 13px;
  color: #646a73;
}

.demo-dropdown-log-empty {
  padding: 16px 0;
  font-size: 13px;
  color: #8f959e;
}

.demo-dropdown-log-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.demo-dropdown-log-row {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 13px;
}

.demo-dropdown-log-time {
  font-variant-numeric: tabular-nums;
  color: #8f959e;
}

.demo-dropdown-log-detail {
  color: #1f2329;
}
</style>

<style>
/* 弹层被 teleport 到 body，必须用非 scoped 样式 */
.demo-dropdown-overlay-root {
  box-shadow: 0 6px 24px rgb(31 35 41 / 12%);
}

.demo-dropdown-overlay-item {
  background-color: #f5f8ff;
}

.demo-dropdown-overlay-item-content {
  color: #3370ff;
}

.demo-dropdown-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 240px;
  padding: 16px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 6px 24px rgb(31 35 41 / 14%);
}

.demo-dropdown-panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2329;
}

.demo-dropdown-panel p {
  margin: 0;
  font-size: 13px;
  color: #646a73;
}
</style>
