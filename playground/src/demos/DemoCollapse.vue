<script setup lang="ts">
import { ref } from 'vue';

import {
  Button,
  Collapse,
  CollapsePanel,
} from '@arvin-studio/ui';

/** Collapse 演示状态（受控 activeKey + change 事件） */
const collapseActiveKey = ref(['panel-1']);
const onCollapseChange = (keys: string[]) => {
  collapseActiveKey.value = keys;
};
/** Collapse items 配置式（key / label / content） */
const collapseItems = [
  { key: 'c1', label: '手风琴 1', content: '手风琴面板 1 的内容' },
  { key: 'c2', label: '手风琴 2', content: '手风琴面板 2 的内容' },
  { key: 'c3', label: '手风琴 3', content: '手风琴面板 3 的内容' },
];
</script>

<template>
    <section id="demo-collapse" class="demo-section">
      <h3>Collapse</h3>

      <h4>基础用法（CollapsePanel 子项 + defaultActiveKey）</h4>
      <div class="collapse-box">
        <Collapse :default-active-key="['p1']">
          <CollapsePanel key="p1" header="这是面板 1 的标题">
            <p>面板 1 的内容，默认展开。</p>
          </CollapsePanel>
          <CollapsePanel key="p2" header="这是面板 2 的标题">
            <p>面板 2 的内容。</p>
          </CollapsePanel>
        </Collapse>
      </div>

      <h4>items 配置式 + accordion 手风琴</h4>
      <div class="collapse-box">
        <Collapse accordion :items="collapseItems" />
      </div>

      <h4>受控模式（activeKey + @change）</h4>
      <div class="collapse-box">
        <Collapse :active-key="collapseActiveKey" @change="onCollapseChange">
          <CollapsePanel key="panel-1" header="面板 A">
            <p>内容 A</p>
          </CollapsePanel>
          <CollapsePanel key="panel-2" header="面板 B">
            <p>内容 B</p>
          </CollapsePanel>
        </Collapse>
        <p>当前展开：{{ collapseActiveKey }}</p>
      </div>

      <h4>expandIconPlacement / ghost / size / 无边框</h4>
      <div class="collapse-box">
        <Collapse expand-icon-placement="end" :default-active-key="['a']">
          <CollapsePanel key="a" header="箭头在右侧">
            <p>expandIconPlacement="end"</p>
          </CollapsePanel>
        </Collapse>
        <Collapse ghost :default-active-key="['b']">
          <CollapsePanel key="b" header="ghost 幽灵风格">
            <p>无边框无背景的 ghost 模式</p>
          </CollapsePanel>
        </Collapse>
        <Collapse size="small" :bordered="false">
          <CollapsePanel key="c" header="small 尺寸 + 无边框">
            <p>size="small"、bordered=false</p>
          </CollapsePanel>
        </Collapse>
      </div>

      <h4>#expandIcon 自定义展开图标</h4>
      <div class="collapse-box">
        <Collapse :default-active-key="['e1']">
          <template #expandIcon="{ isActive }">
            <span>{{ isActive ? '▼' : '▶' }}</span>
          </template>
          <CollapsePanel key="e1" header="自定义展开图标">
            <p>通过 #expandIcon 插槽替换默认箭头。</p>
          </CollapsePanel>
        </Collapse>
      </div>

      <h4>extra 操作区 / #header 插槽</h4>
      <div class="collapse-box">
        <Collapse :default-active-key="['x']">
          <CollapsePanel key="x" header="带 extra 操作">
            <template #extra>
              <Button size="small" @click.stop>更多操作</Button>
            </template>
            <p>extra 插槽内容显示在标题右侧。</p>
          </CollapsePanel>
          <CollapsePanel key="y">
            <template #header><b>自定义 header 插槽</b>（加粗标题）</template>
            <p>通过 #header 插槽自定义标题内容。</p>
          </CollapsePanel>
        </Collapse>
      </div>

      <h4>collapsible 禁用</h4>
      <div class="collapse-box">
        <Collapse>
          <CollapsePanel key="d" header="不可折叠的面板" collapsible="disabled">
            <p>collapsible="disabled" 时面板无法展开/收起。</p>
          </CollapsePanel>
        </Collapse>
      </div>
    </section>
</template>

<style scoped>
h3 {
  margin: 20px 0 4px;
}

h4 {
  margin: 16px 0 4px;
}

.collapse-box {
  width: 100%;
  max-width: 640px;
}
</style>
