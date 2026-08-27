<script setup lang="ts">
import { ref } from 'vue';

import {
  Radio,
  RadioButton,
  RadioGroup,
} from '@arvin-studio/ui';

/** Radio 演示状态 */
const radioValue = ref('A');
const radioValue2 = ref('mon');
const radioValue3 = ref('1');
const radioValue4 = ref('x');
const radioChecked = ref(true);
const radioOptions = [
  { label: '周一', value: 'mon' },
  { label: '周二', value: 'tue' },
  { label: '周三', value: 'wed', disabled: true },
];
</script>

<template>
    <section id="demo-radio" class="demo-section">
      <h3>Radio</h3>

      <h4>RadioGroup（v-model:value + options）</h4>
      <div class="row">
        <RadioGroup v-model:value="radioValue" :options="['A', 'B', 'C']" />
        <span>选中：{{ radioValue }}</span>
      </div>

      <h4>options 对象形式（含禁用项）</h4>
      <div class="row">
        <RadioGroup v-model:value="radioValue2" :options="radioOptions" />
        <span>选中：{{ radioValue2 }}</span>
      </div>

      <h4>RadioButton 按钮样式（optionType / buttonStyle / size）</h4>
      <div class="row">
        <RadioGroup v-model:value="radioValue3" option-type="button">
          <RadioButton value="1">一月</RadioButton>
          <RadioButton value="2">二月</RadioButton>
          <RadioButton value="3">三月</RadioButton>
        </RadioGroup>
      </div>
      <div class="row">
        <RadioGroup
          v-model:value="radioValue4"
          option-type="button"
          button-style="solid"
          size="small"
        >
          <RadioButton value="x">X</RadioButton>
          <RadioButton value="y">Y</RadioButton>
          <RadioButton value="z">Z</RadioButton>
        </RadioGroup>
      </div>

      <h4>单独 Radio（v-model:checked）</h4>
      <div class="row">
        <Radio v-model:checked="radioChecked">开关：{{ radioChecked }}</Radio>
        <Radio disabled>禁用</Radio>
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
