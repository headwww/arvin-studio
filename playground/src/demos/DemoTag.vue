<script setup lang="ts">
import { ref } from 'vue';

import { CheckableTag, CheckableTagGroup, Tag } from '@arvin-studio/ui';

/** 可关闭标签列表 */
const tags = ref(['Vue', 'React', 'Solid']);
const removeTag = (index: number) => {
  tags.value.splice(index, 1);
};

/** CheckableTag 选中集合 */
const checkedTags = ref(['vue', 'react']);
const toggleTag = (value: string, checked: boolean) => {
  checkedTags.value = checked
    ? [...checkedTags.value, value]
    : checkedTags.value.filter((v) => v !== value);
};

/** CheckableTagGroup 单选 / 多选 */
const tagGroupValue = ref('vue');
const tagGroupValues = ref(['vue', 'svelte']);
const tagGroupOptions = [
  { label: 'Vue', value: 'vue' },
  { label: 'React', value: 'react' },
  { label: 'Solid', value: 'solid', disabled: true },
  { label: 'Svelte', value: 'svelte' },
];
</script>

<template>
  <section id="demo-tag" class="demo-section">
    <h3>Tag</h3>

    <h4>基础（预设色 / 状态色 / 自定义色）</h4>
    <div class="row">
      <Tag color="blue">blue</Tag>
      <Tag color="green">green</Tag>
      <Tag color="pink">pink</Tag>
      <Tag color="gold">gold</Tag>
      <Tag color="success">success</Tag>
      <Tag color="processing">processing</Tag>
      <Tag color="error">error</Tag>
      <Tag color="warning">warning</Tag>
      <Tag color="#f50">自定义色</Tag>
    </div>

    <h4>可关闭（closable + @close 动态删除）</h4>
    <div class="row">
      <Tag v-for="(t, i) in tags" :key="t" closable @close="removeTag(i)">
        {{ t }}
      </Tag>
      <span class="hint">点击 × 删除</span>
    </div>

    <h4>icon 前置图标 / variant 变体</h4>
    <div class="row">
      <Tag color="blue" icon="⭐">带图标</Tag>
      <Tag color="blue" variant="filled">filled</Tag>
      <Tag color="blue" variant="outlined">outlined</Tag>
      <Tag color="blue" variant="solid">solid</Tag>
    </div>

    <h4>链接标签 / disabled</h4>
    <div class="row">
      <Tag color="geekblue" href="https://example.com" target="_blank">
        链接标签
      </Tag>
      <Tag disabled>disabled</Tag>
    </div>

    <h4>CheckableTag（受控选中）</h4>
    <div class="row">
      <CheckableTag
        v-for="opt in tagGroupOptions"
        :key="opt.value"
        :checked="checkedTags.includes(opt.value)"
        :disabled="opt.disabled"
        @change="toggleTag(opt.value, $event)"
      >
        {{ opt.label }}
      </CheckableTag>
    </div>
    <span class="hint">选中：{{ checkedTags }}</span>

    <h4>CheckableTagGroup（单选 / 多选）</h4>
    <div class="row">
      <CheckableTagGroup v-model:value="tagGroupValue" :options="tagGroupOptions" />
      <span class="hint">单选：{{ tagGroupValue }}</span>
    </div>
    <div class="row">
      <CheckableTagGroup
        v-model:value="tagGroupValues"
        :options="tagGroupOptions"
        multiple
      />
      <span class="hint">多选：{{ tagGroupValues }}</span>
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
