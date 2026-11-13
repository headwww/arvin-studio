<script setup lang="ts">
import { computed, ref } from 'vue';

import { Button, Input, Space, Tag } from '@arvin-studio/ui';

/**
 * 这就是一个普通的业务页面：
 * 路由已经在 routes.ts 里配好了（/example），逻辑在这里随便写。
 */
const name = ref('');
const count = ref(0);
const history = ref<string[]>([]);

const greeting = computed(() =>
  name.value.trim() ? `你好，${name.value.trim()}！` : '先输入你的名字',
);

function increase() {
  count.value += 1;
  history.value = [`第 ${count.value} 次点击`, ...history.value].slice(0, 5);
}

function reset() {
  count.value = 0;
  history.value = [];
}
</script>

<template>
  <section class="page">
    <h2>写业务的页面</h2>
    <p>
      路由是 <code>/example</code>，页面文件是
      <code>src/views/ExampleView.vue</code>
    </p>
    <p>下面这些交互就是这个页面自己的逻辑，随便改。</p>

    <Space vertical size="middle">
      <Space>
        <Input
          v-model:value="name"
          placeholder="输入名字"
          style="width: 200px"
        />
        <span>{{ greeting }}</span>
      </Space>

      <Space>
        <Button type="primary" @click="increase">点我 +1</Button>
        <Button @click="reset">重置</Button>
        <Tag color="blue">count: {{ count }}</Tag>
      </Space>

      <Space v-if="history.length > 0" wrap>
        <Tag v-for="item in history" :key="item" color="green">
          {{ item }}
        </Tag>
      </Space>
    </Space>
  </section>
</template>
