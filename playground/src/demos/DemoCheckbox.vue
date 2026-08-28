<script setup lang="ts">
import { ref } from 'vue';

import { Checkbox, CheckboxGroup } from '@arvin-studio/ui';

/** Checkbox 演示状态 */
const checkboxChecked = ref(true);
const checkedValues = ref(['A', 'C']);
const checkedValues2 = ref(['apple']);
const checkedValues3 = ref<string[]>([]);
const checkboxOptions = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
  { label: '橘子', value: 'orange', disabled: true },
];
</script>

<template>
  <section id="demo-checkbox" class="demo-section">
    <h3>Checkbox</h3>

    <h4>基础（v-model:checked）</h4>
    <div class="row">
      <Checkbox v-model:checked="checkboxChecked">
        当前：{{ checkboxChecked }}
      </Checkbox>
      <Checkbox default-checked>默认选中</Checkbox>
      <Checkbox disabled>禁用</Checkbox>
      <Checkbox disabled checked>禁用 + 选中</Checkbox>
    </div>

    <h4>CheckboxGroup（options 配置式，v-model:value）</h4>
    <div class="row">
      <CheckboxGroup
        v-model:value="checkedValues"
        :options="['A', 'B', 'C', 'D']"
      />
      <span>选中：{{ checkedValues }}</span>
    </div>
    <div class="row">
      <CheckboxGroup
        v-model:value="checkedValues2"
        :options="checkboxOptions"
      />
      <span>选中：{{ checkedValues2 }}</span>
    </div>

    <h4>CheckboxGroup（插槽子项）</h4>
    <div class="row">
      <CheckboxGroup v-model:value="checkedValues3">
        <Checkbox value="a">选项 A</Checkbox>
        <Checkbox value="b">选项 B</Checkbox>
        <Checkbox value="c" disabled>选项 C（禁用）</Checkbox>
      </CheckboxGroup>
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
</style>
