<script setup lang="ts">
import { ref } from 'vue';

import { Anchor, ConfigProvider } from '@arvin-studio/ui';

import DemoAlert from './demos/DemoAlert.vue';
import DemoAvatar from './demos/DemoAvatar.vue';
import DemoBadge from './demos/DemoBadge.vue';
import DemoBasic from './demos/DemoBasic.vue';
import DemoButton from './demos/DemoButton.vue';
import DemoCheckbox from './demos/DemoCheckbox.vue';
import DemoCollapse from './demos/DemoCollapse.vue';
import DemoDescriptions from './demos/DemoDescriptions.vue';
import DemoDivider from './demos/DemoDivider.vue';
import DemoDrawer from './demos/DemoDrawer.vue';
import DemoEmpty from './demos/DemoEmpty.vue';
import DemoInput from './demos/DemoInput.vue';
import DemoInputNumber from './demos/DemoInputNumber.vue';
import DemoPopconfirm from './demos/DemoPopconfirm.vue';
import DemoPopover from './demos/DemoPopover.vue';
import DemoRadio from './demos/DemoRadio.vue';
import DemoSkeleton from './demos/DemoSkeleton.vue';
import DemoSpace from './demos/DemoSpace.vue';
import DemoTooltip from './demos/DemoTooltip.vue';
import DemoWatermark from './demos/DemoWatermark.vue';

/** 全局 Anchor 导航：按组件分组指向各演示区块 */
const demoItems = [
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
  { key: 'demo-descriptions', href: '#demo-descriptions', title: 'Descriptions' },
  { key: 'demo-divider', href: '#demo-divider', title: 'Divider' },
  { key: 'demo-drawer', href: '#demo-drawer', title: 'Drawer' },
  { key: 'demo-empty', href: '#demo-empty', title: 'Empty' },
  { key: 'demo-skeleton', href: '#demo-skeleton', title: 'Skeleton' },
  { key: 'demo-watermark', href: '#demo-watermark', title: 'Watermark' },
] as const;

/** Anchor 当前高亮链接（演示 change 事件） */
const anchorCurrent = ref('');
const onAnchorChange = (link: string) => {
  anchorCurrent.value = link;
};
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

    <DemoBasic />
    <DemoTooltip />
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
    <DemoSkeleton />
    <DemoWatermark />
  </ConfigProvider>
</template>

<style scoped>
.demo-anchor-nav {
  padding: 8px 0 16px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 8px;
}

.demo-section {
  padding: 8px 0;
}
</style>
