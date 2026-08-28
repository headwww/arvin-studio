<script setup lang="ts">
import { ref } from 'vue';

import { Mentions } from '@arvin-studio/ui';

/** Mentions 演示状态 */
const mentionsValue = ref('');
/** 最近一次 select 的反馈 */
const selectResult = ref('未选择');

/** options 配置式 */
const mentionOptions = [
  { value: 'arvin', content: 'Arvin' },
  { value: 'xiaoming', content: '小明' },
  { value: 'xiaohong', content: '小红' },
];

/** 第二个 Mentions 的 options */
const frameworkOptions = [
  { value: 'vue', content: 'Vue' },
  { value: 'react', content: 'React' },
  { value: 'solid', content: 'Solid' },
];

const onMentionSelect = (option: any, prefix: string) => {
  selectResult.value = `选中 ${option.value}（前缀 ${prefix}）`;
};
</script>

<template>
  <section id="demo-mentions" class="demo-section">
    <h3>Mentions</h3>

    <h4>options 配置式（输入 @ 触发）</h4>
    <Mentions
      v-model:value="mentionsValue"
      :options="mentionOptions"
      placeholder="输入 @ 触发提及"
      style="width: 320px"
    />
    <p>当前值：{{ mentionsValue }}</p>

    <h4>options 配置式 + select 事件</h4>
    <Mentions
      :options="frameworkOptions"
      @select="onMentionSelect"
      placeholder="输入 @ 试试"
      style="width: 320px"
    />
    <p>{{ selectResult }}</p>
  </section>
</template>
