<script setup lang="ts">
import { ref } from 'vue';

import { Anchor, App, ConfigProvider } from '@arvin-studio/ui';

import DemoSelect from './demos/DemoSelect.vue';

/** 全局 Anchor 导航：按组件分组指向各演示区块 */
const demoItems: any = [
  { key: 'demo-basic', href: '#demo-basic', title: '基础组件' },
  { key: 'demo-tooltip', href: '#demo-tooltip', title: 'Tooltip' },
  { key: 'demo-popover', href: '#demo-popover', title: 'Popover' },
  { key: 'demo-popconfirm', href: '#demo-popconfirm', title: 'Popconfirm' },
  { key: 'demo-alert', href: '#demo-alert', title: 'Alert' },
  { key: 'demo-avatar', href: '#demo-avatar', title: 'Avatar' },
  { key: 'demo-button', href: '#demo-button', title: 'Button' },
  { key: 'demo-checkbox', href: '#demo-checkbox', title: 'Checkbox' },
  { key: 'demo-input', href: '#demo-input', title: 'Input' },
  { key: 'demo-inputnumber', href: '#demo-inputnumber', title: 'InputNumber' },
  { key: 'demo-radio', href: '#demo-radio', title: 'Radio' },
  { key: 'demo-space', href: '#demo-space', title: 'Space' },
  { key: 'demo-badge', href: '#demo-badge', title: 'Badge' },
  { key: 'demo-collapse', href: '#demo-collapse', title: 'Collapse' },
  {
    key: 'demo-descriptions',
    href: '#demo-descriptions',
    title: 'Descriptions',
  },
  { key: 'demo-divider', href: '#demo-divider', title: 'Divider' },
  { key: 'demo-drawer', href: '#demo-drawer', title: 'Drawer' },
  { key: 'demo-empty', href: '#demo-empty', title: 'Empty' },
  {
    key: 'demo-float-button',
    href: '#demo-float-button',
    title: 'FloatButton',
  },
  { key: 'demo-image', href: '#demo-image', title: 'Image' },
  { key: 'demo-skeleton', href: '#demo-skeleton', title: 'Skeleton' },
  { key: 'demo-watermark', href: '#demo-watermark', title: 'Watermark' },
  { key: 'demo-masonry', href: '#demo-masonry', title: 'Masonry' },
  { key: 'demo-mentions', href: '#demo-mentions', title: 'Mentions' },
  { key: 'demo-menu', href: '#demo-menu', title: 'Menu' },
  { key: 'demo-spin', href: '#demo-spin', title: 'Spin' },
  { key: 'demo-app', href: '#demo-app', title: 'App' },
  { key: 'demo-message', href: '#demo-message', title: 'Message' },
  { key: 'demo-modal', href: '#demo-modal', title: 'Modal' },
  {
    key: 'demo-notification',
    href: '#demo-notification',
    title: 'Notification',
  },
  { key: 'demo-progress', href: '#demo-progress', title: 'Progress' },
  { key: 'demo-qrcode', href: '#demo-qrcode', title: 'QRCode' },
  { key: 'demo-rate', href: '#demo-rate', title: 'Rate' },
  { key: 'demo-result', href: '#demo-result', title: 'Result' },
  { key: 'demo-segmented', href: '#demo-segmented', title: 'Segmented' },
  { key: 'demo-select', href: '#demo-select', title: 'Select' },
] as const;

/** Anchor 当前高亮链接（演示 change 事件） */
const anchorCurrent = ref('');
const onAnchorChange = (link: string) => {
  anchorCurrent.value = link;
};
</script>

<template>
  <ConfigProvider>
    <App>
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

      <!-- ==================== 全局 Anchor 导航 ==================== -->
      <div class="demo-anchor-nav">
        <Anchor
          :items="demoItems"
          direction="horizontal"
          :offset-top="16"
          :target-offset="120"
          @change="onAnchorChange"
        >
          <template #item="{ title }">
            <span>📍 {{ title }}</span>
          </template>
        </Anchor>
      </div>

      <!-- <DemoTooltip />
    <DemoPopover />
    <DemoPopconfirm />
    <DemoAlert />
    <DemoAvatar />
    <DemoButton />
    <DemoCheckbox />
    <DemoInput />
    <DemoInputNumber />
    <DemoRadio />
    <DemoSpace />
    <DemoBadge />
    <DemoCollapse />
    <DemoDescriptions />
    <DemoDivider />
    <DemoDrawer />
    <DemoEmpty />
    <DemoFloatButton />
    <DemoImage />
    <DemoSkeleton />
    <DemoWatermark />
    <DemoMasonry />
    <DemoMentions />
    <DemoMenu />
    <DemoSpin />
    <DemoApp />
    <DemoMessage />
    <DemoModal />
    <DemoNotification />
    <DemoProgress />
    <DemoQRCode />
    <DemoRate />
    <DemoResult />
    <DemoSegmented /> -->
      <DemoSelect />
    </App>
  </ConfigProvider>
</template>

<style scoped>
.demo-anchor-nav {
  padding: 8px 0 16px;
  margin-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.demo-section {
  padding: 8px 0;
}
</style>
