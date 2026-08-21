<script setup lang="ts">
import { h } from 'vue';

import { Trigger } from '@arvin-studio/headless';
import {
  Checkbox,
  CheckboxGroup,
  ConfigProvider,
  InputNumber,
  Switch,
} from '@arvin-studio/ui';

// popup 支持"VNode 或 返回 VNode 的函数"两种形态；
// 用函数形式更稳（每次打开都会重新求值，内容不会因缓存过期）
const popupContent = () =>
  h(
    'div',
    {
      style: {
        padding: '12px',
        background: '#fff',
        border: '1px solid #d9d9d9',
        borderRadius: '4px',
      },
    },
    '这是一个 Tooltip 风格的弹出层',
  );
</script>

<template>
  <ConfigProvider>
    <!-- <SpaceCompact>
      <Button type="primary"> Button </Button>
      <SpaceAddon> $ </SpaceAddon>
    </SpaceCompact>
    <Space separator="=">
      <Button color="pink" :loading="false" variant="solid">按钮</Button>
      <Button color="pink" :loading="false" variant="solid">按钮</Button>
    </Space> -->
    <!-- <Input :maxlength="1" />
    <InputPassword />
    <InputOTP />
    <InputSearch /> -->
    <InputNumber />
    <CheckboxGroup>
      <Checkbox>sss</Checkbox>
      <Checkbox>sss</Checkbox>
    </CheckboxGroup>
    <Trigger
      action="hover"
      popup-placement="top"
      :builtin-placements="{
        top: {
          points: ['bc', 'tc'],
          offset: [0, -4],
          overflow: { adjustX: 1, adjustY: 1 },
        },
        bottom: {
          points: ['tc', 'bc'],
          offset: [0, 4],
          overflow: { adjustX: 1, adjustY: 1 },
        },
      }"
      :popup="popupContent"
      :mouse-enter-delay="0.1"
      :mouse-leave-delay="0.1"
    >
      <button>hover 我试试</button>
    </Trigger>
    <Switch />
    <!-- <TextArea /> -->
  </ConfigProvider>
</template>
