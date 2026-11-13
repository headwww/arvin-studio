<script setup lang="ts">
import { useRouter } from 'vue-router';

import { Button } from '@arvin-studio/ui';

const router = useRouter();
</script>

<template>
  <section class="page">
    <h2>页面不存在</h2>
    <p>这个地址没有对应任何路由，检查一下 URL，或者回首页看看。</p>
    <Button type="primary" @click="router.push('/')">回到首页</Button>
  </section>
</template>
