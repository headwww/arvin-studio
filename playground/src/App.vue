<script setup lang="ts">
import { Button, ConfigProvider } from '@arvin-studio/ui';
</script>

<template>
  <ConfigProvider>
    <Button color="pink" :loading="false" variant="solid">按钮</Button>
  </ConfigProvider>
</template>
