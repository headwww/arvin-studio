<script setup lang="ts">
import {
  Button,
  ConfigProvider,
  SpaceAddon,
  SpaceCompact,
} from '@arvin-studio/ui';
</script>

<template>
  <ConfigProvider>
    <SpaceCompact>
      <Button type="primary"> Button </Button>
      <SpaceAddon> $ </SpaceAddon>
    </SpaceCompact>
    <Space separator="=">
      <Button color="pink" :loading="false" variant="solid">按钮</Button>
      <Button color="pink" :loading="false" variant="solid">按钮</Button>
    </Space>
  </ConfigProvider>
</template>
