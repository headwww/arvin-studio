<script setup lang="ts">
import { ref } from 'vue';

import { Select, SelectOptGroup, SelectOption } from '@arvin-studio/ui';

/** Select 演示状态 */
const selectValue = ref();
const selectValue2 = ref('vue');
const multipleValue = ref(['vue']);
const tagsValue = ref(['标签']);

/** options 配置式（含禁用项） */
const options = [
  { value: 'vue', label: 'Vue' },
  { value: 'react', label: 'React' },
  { value: 'solid', label: 'Solid', disabled: true },
  { value: 'svelte', label: 'Svelte' },
];
</script>

<template>
  <section id="demo-select" class="demo-section">
    <h3>Select</h3>

    <h4>基础（options 配置式 + v-model:value）</h4>
    <div class="row">
      <Select
        v-model:value="selectValue"
        :options="options"
        placeholder="请选择框架"
        style="width: 200px"
      />
      <span class="hint">当前：{{ selectValue }}</span>
    </div>

    <h4>showSearch 可搜索</h4>
    <div class="row">
      <Select
        v-model:value="selectValue2"
        :options="options"
        show-search
        placeholder="搜索并选择"
        style="width: 200px"
      />
    </div>

    <h4>multiple 多选（maxTagCount / allowClear）</h4>
    <div class="row">
      <Select
        v-model:value="multipleValue"
        :options="options"
        mode="multiple"
        :max-tag-count="2"
        allow-clear
        placeholder="多选"
        style="width: 240px"
      />
      <span class="hint">当前：{{ multipleValue }}</span>
    </div>

    <h4>tags 标签模式（输入回车创建）</h4>
    <div class="row">
      <Select
        v-model:value="tagsValue"
        :options="options"
        mode="tags"
        allow-clear
        placeholder="输入并回车"
        style="width: 240px"
      />
    </div>

    <h4>禁用 / size / variant</h4>
    <div class="row">
      <Select :options="options" disabled placeholder="禁用" style="width: 160px" />
      <Select size="small" :options="options" placeholder="small" style="width: 160px" />
      <Select variant="filled" :options="options" placeholder="filled" style="width: 160px" />
      <Select variant="borderless" :options="options" placeholder="borderless" style="width: 160px" />
    </div>

    <h4>分组（SelectOptGroup）</h4>
    <div class="row">
      <Select placeholder="分组选择" style="width: 200px">
        <SelectOptGroup label="前端">
          <SelectOption value="vue">Vue</SelectOption>
          <SelectOption value="react">React</SelectOption>
        </SelectOptGroup>
        <SelectOptGroup label="后端">
          <SelectOption value="node">Node</SelectOption>
          <SelectOption value="go">Go</SelectOption>
        </SelectOptGroup>
      </Select>
    </div>

    <h4>#option 插槽（自定义选项内容）</h4>
    <div class="row">
      <Select :options="options" placeholder="自定义选项" style="width: 220px">
        <template #option="{ value, label }">
          <span>⭐ {{ label }}（{{ value }}）</span>
        </template>
      </Select>
    </div>

    <h4>status / loading</h4>
    <div class="row">
      <Select :options="options" status="error" placeholder="error" style="width: 160px" />
      <Select :options="options" status="warning" placeholder="warning" style="width: 160px" />
      <Select :options="options" loading placeholder="loading" style="width: 160px" />
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

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  padding: 8px 0;
}

.hint {
  color: #999;
  font-size: 12px;
}
</style>
