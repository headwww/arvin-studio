<script setup lang="ts">
import { ref } from 'vue';

import {
  Input,
} from '@arvin-studio/ui';

/** Input 演示状态 */
const inputValue = ref('');
</script>

<template>
    <section id="demo-input" class="demo-section">
      <h3>Input</h3>

      <h4>基础（v-model:value）</h4>
      <div class="row">
        <Input
          v-model:value="inputValue"
          placeholder="请输入内容"
          style="width: 220px"
        />
        <span>值：{{ inputValue }}</span>
      </div>

      <h4>size / disabled / readonly / status</h4>
      <div class="row">
        <Input size="small" placeholder="small" style="width: 140px" />
        <Input placeholder="medium" style="width: 140px" />
        <Input size="large" placeholder="large" style="width: 140px" />
        <Input disabled placeholder="disabled" style="width: 140px" />
        <Input readonly value="只读内容" style="width: 140px" />
        <Input status="error" placeholder="error 状态" style="width: 140px" />
        <Input
          status="warning"
          placeholder="warning 状态"
          style="width: 140px"
        />
      </div>

      <h4>maxlength + showCount / allowClear</h4>
      <div class="row">
        <Input
          :maxlength="10"
          show-count
          placeholder="最多 10 字"
          style="width: 220px"
        />
        <Input
          allow-clear
          default-value="可清除"
          placeholder="allowClear"
          style="width: 220px"
        />
      </div>

      <h4>prefix / suffix 插槽</h4>
      <div class="row">
        <Input placeholder="前缀" style="width: 220px">
          <template #prefix>🔍</template>
        </Input>
        <Input placeholder="后缀" style="width: 220px">
          <template #suffix>@qq.com</template>
        </Input>
      </div>

      <h4>variant 变体</h4>
      <div class="row">
        <Input variant="outlined" placeholder="outlined" style="width: 160px" />
        <Input variant="filled" placeholder="filled" style="width: 160px" />
        <Input
          variant="borderless"
          placeholder="borderless"
          style="width: 160px"
        />
        <Input
          variant="underlined"
          placeholder="underlined"
          style="width: 160px"
        />
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
