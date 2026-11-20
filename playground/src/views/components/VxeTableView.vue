<script setup lang="ts">
import { ref } from 'vue';

import { Button, Popover, UniqueProvider } from '@arvin-studio/ui';

const items = ['姓名', '年龄', '城市'];
const active = ref<null | string>(null);
</script>

<template>
  <UniqueProvider>
    <div class="demo-row">
      <Popover
        v-for="item in items"
        :key="item"
        :title="`${item}的提示`"
        :open="active === item"
        placement="bottom"
      >
        <span
          class="demo-trigger"
          @mouseenter="active = item"
          @mouseleave="active = null"
        >
          <Button>{{ item }}</Button>
        </span>
      </Popover>
    </div>
  </UniqueProvider>
</template>

<style scoped>
.demo-row {
  display: flex;
  gap: 12px;
  padding: 40px;
}

.demo-trigger {
  display: inline-flex;
}
</style>
