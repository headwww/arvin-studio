<script setup lang="ts">
/**
 * SharedTooltip 使用示例。
 *
 * 组件有几个容易踩的点，示例按这些点分组：
 * 1. 默认插槽里放触发元素，且只放一个：组件挂载后会把它搬出面板容器；
 * 2. 面板固定渲染到 body，父级的 overflow / transform 不会裁切它；
 * 3. 一个实例可以通过 selector / openByEvent 服务多个目标（“共享”的含义）；
 * 4. trigger="manual" 时显隐交给 v-model 或实例方法；实例 open() 不传 content
 *    且组件没有 #content 插槽时不会显示，所以下面的 open() 都显式传了内容。
 */
import type { AsSharedTooltipInstance } from '@arvin-studio/ui';

import { ref } from 'vue';

import { Button, SharedTooltip } from '@arvin-studio/ui';

/** 手动模式：trigger="manual" + v-model 控制显隐 */
const manualOpen = ref(false);
const manualTipRef = ref<AsSharedTooltipInstance>();

/** 共享单例：整张列表共用一个面板，每次显示时传入对应行的内容 */
const sharedTipRef = ref<AsSharedTooltipInstance>();

interface SharedRow {
  content: string;
  id: number;
  summary: string;
}

const sharedRows: SharedRow[] = [
  {
    id: 1,
    summary: '订单 A-1001 · 已支付 · 上海仓 · 预计明天送达',
    content: '订单 A-1001：已支付，上海仓已发货，预计明天送达。',
  },
  {
    id: 2,
    summary: '订单 A-1002 · 待付款 · 杭州仓 · 明早 9 点前',
    content: '订单 A-1002：待付款，杭州仓有货，需要在明早 9 点前完成支付。',
  },
  {
    id: 3,
    summary: '订单 A-1003 · 已退款 · 广州仓 · 已回滚库存',
    content: '订单 A-1003：已退款，广州仓库存已回滚，退款 3 个工作日到账。',
  },
];

/** openByEvent 会用鼠标位置定位面板和箭头，所以要把事件对象传进去 */
function showSharedTip(event: MouseEvent, content: string) {
  sharedTipRef.value?.openByEvent(
    event,
    event.currentTarget as HTMLElement,
    content,
  );
}

/** 共享实例：三个按钮共用一个面板，open(target, content) 显式传入目标与内容 */
const sharedButtonTipRef = ref<AsSharedTooltipInstance>();

const sharedButtons = [1, 2, 3];

function openSharedButtonTip(event: MouseEvent, index: number) {
  sharedButtonTipRef.value?.open(
    event.currentTarget as HTMLElement,
    `共用一个实例 ${index}：内容是第 ${index} 个按钮的。`,
  );
}

function closeSharedButtonTip() {
  sharedButtonTipRef.value?.close();
}

/** selector 模式：目标元素由选择器指定，不需要默认插槽 */
const selectorOpen = ref(false);
const selectorTipRef = ref<AsSharedTooltipInstance>();

/** enterable：面板里放可交互内容，鼠标移入面板不会关闭 */
const clickCount = ref(0);

const htmlContent =
  '<b>use-html</b> 会把 content 当作 innerHTML 渲染，<i>只用于可信内容</i>。';

const longText =
  '尺寸由 width / minWidth / maxWidth / height / maxHeight 控制。\n超出 max-height 后内容区可以滚动，文字里的换行会被保留。';

/** 实例 open() 可以临时传入内容，优先级高于 content prop */
function openManualTip() {
  manualTipRef.value?.open(
    undefined,
    '实例 open(target, content) 打开：这次传入的内容覆盖了 content prop。',
  );
}

/** 不传 target 时会回落到 selector 指定的元素 */
function openSelectorTip() {
  selectorTipRef.value?.open(
    undefined,
    '实例 open() 打开了 selector 指向的元素，content 同样由本次调用传入。',
  );
}
</script>

<template>
  <section id="demo-shared-tooltip" class="demo-section">
    <h3>SharedTooltip</h3>

    <h4>基础用法：hover 触发 + content</h4>
    <div class="row">
      <SharedTooltip content="默认 500ms 后出现，鼠标移出后关闭">
        <Button>hover（默认延迟 500ms）</Button>
      </SharedTooltip>
      <SharedTooltip content="enter-delay=0，鼠标移入立即出现" :enter-delay="0">
        <Button>hover（enter-delay=0）</Button>
      </SharedTooltip>
    </div>
    <p class="demo-note">
      默认插槽只放一个触发元素；面板挂在 body 上，不会被父级滚动容器裁切。
    </p>

    <h4>placement：固定方向 / 自动翻转</h4>
    <div class="row">
      <SharedTooltip content="固定显示在触发元素上方" placement="top">
        <Button>placement=top</Button>
      </SharedTooltip>
      <SharedTooltip content="固定显示在触发元素下方" placement="bottom">
        <Button>placement=bottom</Button>
      </SharedTooltip>
      <SharedTooltip
        content="优先显示在上方，空间不足时自动翻到下方"
        default-placement="top"
      >
        <Button>default-placement=top</Button>
      </SharedTooltip>
      <SharedTooltip
        content="优先显示在下方，空间不足时自动翻到上方"
        default-placement="bottom"
      >
        <Button>default-placement=bottom</Button>
      </SharedTooltip>
    </div>
    <p class="demo-note">
      不写 placement 时按 default-placement
      自动翻转：把页面滚到触发元素贴近视口边缘， 再 hover 就能看到面板换边。
    </p>

    <h4>trigger：hover / click</h4>
    <div class="row">
      <SharedTooltip content="点击触发元素切换显隐" trigger="click">
        <Button>trigger=click</Button>
      </SharedTooltip>
    </div>

    <h4>trigger=manual：v-model 与实例方法</h4>
    <div class="row">
      <SharedTooltip
        ref="manualTipRef"
        v-model="manualOpen"
        content="手动模式：显隐完全由外部控制"
        trigger="manual"
      >
        <Button>manual 的触发元素</Button>
      </SharedTooltip>
      <Button @click="manualOpen = !manualOpen">
        v-model 切换（当前：{{ manualOpen }}）
      </Button>
      <Button @click="openManualTip()">实例 open()</Button>
      <Button @click="manualTipRef?.close()">实例 close()</Button>
    </div>
    <p class="demo-note">
      manual 模式下组件不会自己绑定 hover / click；用 v-model 或
      <code>open()</code> / <code>close()</code> 控制。
    </p>

    <h4>共享单例：一个面板服务整个列表（openByEvent）</h4>
    <div class="demo-list">
      <div
        v-for="row in sharedRows"
        :key="row.id"
        class="demo-list__row"
        @mouseenter="showSharedTip($event, row.content)"
        @mouseleave="sharedTipRef?.close()"
      >
        {{ row.summary }}
      </div>
    </div>
    <!-- 没有默认插槽：这个实例只作为面板容器，目标在 openByEvent 时传入 -->
    <SharedTooltip ref="sharedTipRef" trigger="manual" :enter-delay="0" />
    <p class="demo-note">
      列表只挂了一个 SharedTooltip，hover 任意一行时调用
      <code>openByEvent(event, target, content)</code>：面板位置按该行重算，
      箭头跟着鼠标，内容也换成这一行的。
    </p>

    <h4>共享实例：三个按钮共用一个面板（open）</h4>
    <div class="row">
      <Button
        v-for="item in sharedButtons"
        :key="item"
        @mouseenter="openSharedButtonTip($event, item)"
        @mouseleave="closeSharedButtonTip()"
      >
        共用一个实例 {{ item }}
      </Button>
    </div>
    <!-- 同样不写默认插槽，目标元素由 open(target, content) 传入 -->
    <SharedTooltip ref="sharedButtonTipRef" trigger="manual" />
    <p class="demo-note">
      三个按钮共用一个面板：mouseenter 时
      <code>open(event.currentTarget, content)</code>，mouseleave 时
      <code>close()</code>。和 vxe 的
      <code>$tooltip.open($event.target, content)</code> 写法一致。
    </p>

    <h4>selector：把面板绑定到外部元素</h4>
    <div class="row">
      <Button
        id="shared-tooltip-selector-target"
        @click="selectorOpen = !selectorOpen"
      >
        selector 指向的按钮
      </Button>
      <Button @click="selectorOpen = !selectorOpen">
        v-model 切换（当前：{{ selectorOpen }}）
      </Button>
      <Button @click="openSelectorTip()">实例 open()</Button>
      <Button @click="selectorTipRef?.close()">实例 close()</Button>
    </div>
    <SharedTooltip
      ref="selectorTipRef"
      v-model="selectorOpen"
      content="selector 指向左侧按钮，面板位置跟着这个按钮计算"
      selector="#shared-tooltip-selector-target"
      trigger="manual"
    />

    <h4>内容形式：use-html / #content 插槽</h4>
    <div class="row">
      <SharedTooltip :content="htmlContent" :use-html="true">
        <Button>use-html 渲染 HTML</Button>
      </SharedTooltip>
      <SharedTooltip>
        <template #content>
          <div class="demo-tip">
            <div class="demo-tip__title">#content 插槽</div>
            <div>插槽内容可以是任意节点，优先级高于 content 和 use-html。</div>
          </div>
        </template>
        <Button>#content 插槽</Button>
      </SharedTooltip>
    </div>

    <h4>enterable：鼠标可以移入面板</h4>
    <div class="row">
      <SharedTooltip :enter-delay="0" :leave-delay="200" enterable>
        <template #content>
          <div class="demo-tip">
            <div class="demo-tip__title">面板里可以放交互元素</div>
            <div>鼠标从触发元素移入面板时不会关闭。</div>
            <div class="demo-tip__actions">
              <Button size="small" @click="clickCount += 1">点我 +1</Button>
              <span>已点击 {{ clickCount }} 次</span>
            </div>
          </div>
        </template>
        <Button>enterable（移入面板不关闭）</Button>
      </SharedTooltip>
    </div>

    <h4>尺寸限制：width / max-width / max-height</h4>
    <div class="row">
      <SharedTooltip :content="longText" :max-width="220">
        <Button>max-width=220</Button>
      </SharedTooltip>
      <SharedTooltip :content="longText" :height="72" :width="200">
        <Button>width=200 height=72（可滚动）</Button>
      </SharedTooltip>
    </div>

    <h4>use-scrollbar：内容区使用 Scrollbar</h4>
    <div class="row">
      <SharedTooltip
        use-scrollbar
        :content="longText"
        :width="220"
        :height="120"
        :max-height="120"
      >
        <Button>use-scrollbar</Button>
      </SharedTooltip>
    </div>

    <h4>外观：箭头与自定义类名</h4>
    <div class="row">
      <SharedTooltip content="is-arrow=false，不渲染箭头" :is-arrow="false">
        <Button>is-arrow=false</Button>
      </SharedTooltip>
      <SharedTooltip
        content="popup-class-name 会加到挂在 body 的面板容器上"
        :is-arrow="false"
        popup-class-name="shared-tooltip-demo--accent"
      >
        <Button>popup-class-name</Button>
      </SharedTooltip>
    </div>
  </section>
</template>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  padding: 8px 0;
}

h3 {
  margin: 20px 0 4px;
}

h4 {
  margin: 16px 0 4px;
}

.demo-note {
  margin: 4px 0 12px;
  font-size: 13px;
  line-height: 1.7;
  color: #888;
}

/* 共享单例示例的列表 */
.demo-list {
  overflow: hidden;
  border: 1px solid rgb(5 5 5 / 6%);
  border-radius: 8px;
}

.demo-list__row {
  padding: 10px 14px;
  font-size: 14px;
  line-height: 22px;
  color: rgb(0 0 0 / 88%);
  cursor: default;
  border-bottom: 1px solid rgb(5 5 5 / 6%);
  transition: background-color 0.2s;
}

.demo-list__row:last-child {
  border-bottom: none;
}

.demo-list__row:hover {
  background: rgb(22 119 255 / 6%);
}
</style>

<!-- 面板挂在 body 下，scoped 样式无法命中，面板内的样式必须放在全局样式里 -->
<style>
.shared-tooltip-demo--accent .as-shared-tooltip-body {
  background: linear-gradient(135deg, #1677ff 0%, #722ed1 100%);
}

.shared-tooltip-demo--accent .as-shared-tooltip-content {
  font-weight: 600;
  letter-spacing: 0.2px;
}

.demo-tip {
  min-width: 160px;
  line-height: 1.7;
}

.demo-tip__title {
  margin-bottom: 4px;
  font-weight: 600;
}

.demo-tip__actions {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 8px;
}
</style>
