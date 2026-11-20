<script setup lang="ts">
import { computed, reactive, ref } from 'vue';

import { Button, Input, PositionPopup, Switch, Tag } from '@arvin-studio/ui';

interface AnchorRect {
  height: number;
  width: number;
  x: number;
  y: number;
}

interface DemoRow {
  email: string;
  id: number;
  name: string;
  role: string;
}

interface RowPopupState {
  anchor: AnchorRect;
  open: boolean;
  rowId: number;
}

const placements = [
  'bottom',
  'bottomLeft',
  'bottomRight',
  'top',
  'topLeft',
  'topRight',
] as const;
type Placement = (typeof placements)[number];

/** 把元素的视口矩形换算成 PositionPopup 需要的文档坐标 */
function toAnchor(el: HTMLElement): AnchorRect {
  const rect = el.getBoundingClientRect();

  return {
    x: rect.left + window.scrollX,
    y: rect.top + window.scrollY,
    width: rect.width,
    height: rect.height,
  };
}

const emptyAnchor = (): AnchorRect => ({ x: 0, y: 0, width: 0, height: 0 });

/* -------------------- 1. 基础：open / placement / arrow -------------------- */
const basicOpen = ref(false);
const basicAnchor = ref<AnchorRect>(emptyAnchor());
const placement = ref<Placement>('bottom');
const arrow = ref(true);
const basicLog = ref('还没有事件');
const innerClicks = ref(0);
const inputValue = ref('');

function openBasic(event: MouseEvent) {
  basicAnchor.value = toAnchor(event.currentTarget as HTMLElement);
  basicOpen.value = true;
}

function onBasicOpenChange(open: boolean) {
  basicLog.value = `openChange(${open})`;
  basicOpen.value = open;
}

/* -------------------- 2. 多锚点：跟着列表行切换 -------------------- */
const rows: DemoRow[] = [
  { id: 1, name: '林晚舟', role: '前端', email: 'wanzhou.lin@example.com' },
  { id: 2, name: '陈叙白', role: '后端', email: 'xubai.chen@example.com' },
  { id: 3, name: '苏照影', role: '设计', email: 'zhaoying.su@example.com' },
  { id: 4, name: '顾行舟', role: '测试', email: 'xingzhou.gu@example.com' },
  { id: 5, name: '沈知微', role: '产品', email: 'zhiwei.shen@example.com' },
];

const rowPopup = reactive<RowPopupState>({
  anchor: emptyAnchor(),
  open: false,
  rowId: rows[0].id,
});

const activeRow = computed(
  () => rows.find((row) => row.id === rowPopup.rowId) ?? rows[0],
);

function toggleRow(row: DemoRow, event: MouseEvent) {
  // 弹层打开时点按钮会被 document 的 click 当成「外部点击」，
  // 所以按钮上加了 @click.stop，这一行才有机会切锚点而不是先被关掉。
  if (rowPopup.open && rowPopup.rowId === row.id) {
    rowPopup.open = false;
    return;
  }

  rowPopup.anchor = toAnchor(event.currentTarget as HTMLElement);
  rowPopup.rowId = row.id;
  rowPopup.open = true;
}

/* -------------------- 3. 受控 x / y：改坐标自动重对齐 -------------------- */
const boxRef = ref<{ forceAlign?: () => void }>();
const boxOpen = ref(false);
const boxAnchor = ref<AnchorRect | null>(null);
const boxOffset = reactive({ dx: 0, dy: 0 });
const boxRows = ref(2);

const boxX = computed(() => (boxAnchor.value?.x ?? 0) + boxOffset.dx);
const boxY = computed(() => (boxAnchor.value?.y ?? 0) + boxOffset.dy);
const boxLines = computed(() =>
  Array.from({ length: boxRows.value }, (_, index) => `第 ${index + 1} 行内容`),
);

function openBox(event: MouseEvent) {
  boxAnchor.value = toAnchor(event.currentTarget as HTMLElement);
  boxOffset.dx = 0;
  boxOffset.dy = 0;
  boxOpen.value = true;
}

/* -------------------- 4. 贴底打开：空间不够自动翻转 -------------------- */
const flipOpen = ref(false);
const flipAnchor = ref<AnchorRect>(emptyAnchor());
const flipInfo = ref('');

function openNearBottom(event: MouseEvent) {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();

  // 锚点钉在当前视口最底部：bottom 放不下，Trigger 应该自动翻到上方
  flipAnchor.value = {
    x: rect.left + window.scrollX,
    y: window.scrollY + window.innerHeight - 12,
    width: rect.width,
    height: 12,
  };
  flipOpen.value = true;
  flipInfo.value = `锚点 y = ${Math.round(flipAnchor.value.y)}（视口底部）`;
}
</script>

<template>
  <div class="demo-grid">
    <section class="demo-card">
      <h4>1. 基础：open / placement / arrow</h4>
      <div class="controls" @click.stop>
        <Button type="primary" @click="openBasic">打开弹层</Button>
        <span>arrow</span>
        <Switch v-model:checked="arrow" size="small" />
      </div>
      <div class="controls" @click.stop>
        <Button
          v-for="item in placements"
          :key="item"
          :type="placement === item ? 'primary' : 'default'"
          size="small"
          @click="placement = item"
        >
          {{ item }}
        </Button>
      </div>
      <p class="hint">
        锚点靠近视口顶部，选 top / topLeft / topRight 时上方放不下，Trigger
        会自动翻到下方（overflow.adjustY）。
      </p>
      <p class="status">
        事件：{{ basicLog }}；点击弹层内部 {{ innerClicks }} 次
      </p>

      <PositionPopup
        :arrow="arrow"
        :content-style="{ width: '240px' }"
        :height="basicAnchor.height"
        :open="basicOpen"
        :placement="placement"
        :width="basicAnchor.width"
        :x="basicAnchor.x"
        :y="basicAnchor.y"
        root-class-name="popup-basic"
        @open-change="onBasicOpenChange"
      >
        <div class="popup-body">
          <p>当前 placement：{{ placement }}</p>
          <p>点弹层内部不会关闭，输入框可以正常输入。</p>
          <Input v-model:value="inputValue" placeholder="在这里输入" />
          <div class="controls">
            <Button size="small" @click="innerClicks += 1">
              内层点击 {{ innerClicks }}
            </Button>
            <Button size="small" type="primary" @click="basicOpen = false">
              关闭
            </Button>
          </div>
        </div>
      </PositionPopup>
    </section>

    <section class="demo-card">
      <h4>2. 多锚点：跟着列表行切换</h4>
      <p class="hint">
        每行都是独立锚点；打开状态下切到另一行会重新计算 x /
        y。点页面空白处关闭。
      </p>
      <div class="rows">
        <div v-for="row in rows" :key="row.id" class="row-item">
          <span class="row-name">{{ row.name }}</span>
          <Tag>{{ row.role }}</Tag>
          <span class="row-email">{{ row.email }}</span>
          <Button size="small" @click.stop="toggleRow(row, $event)">
            {{ rowPopup.open && rowPopup.rowId === row.id ? '关闭' : '编辑' }}
          </Button>
        </div>
      </div>

      <PositionPopup
        :height="rowPopup.anchor.height"
        :open="rowPopup.open"
        placement="bottomRight"
        :width="rowPopup.anchor.width"
        :x="rowPopup.anchor.x"
        :y="rowPopup.anchor.y"
        root-class-name="popup-row"
        @open-change="(open) => (rowPopup.open = open)"
      >
        <div class="popup-body">
          <p>
            <strong>{{ activeRow.name }}</strong>
            <Tag class="row-tag">{{ activeRow.role }}</Tag>
          </p>
          <p>{{ activeRow.email }}</p>
          <div class="controls">
            <Button size="small" type="primary" @click="rowPopup.open = false">
              保存并关闭
            </Button>
            <Button size="small" @click="rowPopup.open = false">取消</Button>
          </div>
        </div>
      </PositionPopup>
    </section>

    <section class="demo-card">
      <h4>3. 受控 x / y：改坐标自动重对齐</h4>
      <p class="hint">
        改 x / y 会触发组件内部的 watch 重新对齐；内容行数变化则由
        ResizeObserver 触发重对齐。这些按钮在弹层外，不拦住 click
        会按“外部点击”把弹层关掉，所以这里加了 <code>@click.stop</code>。
      </p>
      <div class="controls" @click.stop>
        <Button type="primary" @click="openBox">打开弹层</Button>
        <Button size="small" @click="boxOffset.dx -= 20">x - 20</Button>
        <Button size="small" @click="boxOffset.dx += 20">x + 20</Button>
        <Button size="small" @click="boxOffset.dy -= 20">y - 20</Button>
        <Button size="small" @click="boxOffset.dy += 20">y + 20</Button>
        <Button size="small" @click="boxRef?.forceAlign?.()">
          forceAlign()
        </Button>
      </div>
      <div class="controls" @click.stop>
        <Button size="small" @click="boxRows -= 1">内容行数 -</Button>
        <Button size="small" @click="boxRows += 1">内容行数 +</Button>
      </div>
      <p class="status">
        x: {{ boxX }}，y: {{ boxY }}（偏移 {{ boxOffset.dx }},
        {{ boxOffset.dy }}）
      </p>

      <PositionPopup
        ref="boxRef"
        :content-style="{ width: '220px' }"
        :height="boxAnchor?.height"
        :open="boxOpen"
        placement="bottom"
        :width="boxAnchor?.width"
        :x="boxX"
        :y="boxY"
        root-class-name="popup-box"
        @open-change="(open) => (boxOpen = open)"
      >
        <div class="popup-body">
          <p v-for="line in boxLines" :key="line">{{ line }}</p>
          <p>{{ boxRows }} 行，{{ boxRows > 2 ? '偏高' : '偏矮' }}</p>
        </div>
      </PositionPopup>
    </section>
  </div>
</template>

<style scoped>
h4 {
  margin: 0 0 12px;
  font-size: 14px;
}

p {
  margin: 4px 0;
  font-size: 13px;
  line-height: 1.6;
  color: #555;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
  gap: 16px;
}

.demo-card {
  min-width: 0;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 10px;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin: 8px 0;
  font-size: 13px;
  color: #666;
}

.status {
  padding: 6px 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  color: #666;
  background: #fafafa;
  border-radius: 6px;
}

.hint {
  color: #888;
}

.popup-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rows {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.row-item {
  display: grid;
  grid-template-columns: 72px 52px minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
  padding: 6px 8px;
  font-size: 13px;
  background: #fafafa;
  border-radius: 8px;
}

.row-name {
  font-weight: 500;
  color: #333;
}

.row-email {
  overflow: hidden;
  text-overflow: ellipsis;
  color: #888;
  white-space: nowrap;
}

.row-tag {
  margin-left: 8px;
}
</style>
