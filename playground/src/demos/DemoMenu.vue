<script setup lang="ts">
import type { MenuItemType } from '@arvin-studio/ui';

import { h, ref } from 'vue';

import {
  AppstoreOutlined,
  MailOutlined,
  SettingOutlined,
} from '@arvin-studio/icons';
import { Menu } from '@arvin-studio/ui';

const current = ref('mail');

function handleClick(e: any) {
  current.value = e.key;
}

const items: MenuItemType[] = [
  {
    label: 'Navigation One',
    key: 'mail',
    icon: MailOutlined,
  },
  {
    label: 'Navigation Two',
    key: 'app',
    icon: AppstoreOutlined,
    disabled: true,
  },
  {
    label: 'Navigation Three - Submenu',
    key: 'SubMenu',
    icon: SettingOutlined,
    children: [
      {
        type: 'group',
        label: 'Item 1',
        children: [
          { label: 'Option 1', key: 'setting:1' },
          { label: 'Option 2', key: 'setting:2' },
        ],
      },
      {
        type: 'group',
        label: 'Item 2',
        children: [
          { label: 'Option 3', key: 'setting:3' },
          { label: 'Option 4', key: 'setting:4' },
        ],
      },
    ],
  },
  {
    key: 'alipay',
    label: h(
      'a',
      {
        href: 'https://ant.design',
        target: '_blank',
        rel: 'noopener noreferrer',
      },
      'Navigation Four - Link',
    ),
  },
];
</script>

<template>
  <section id="demo-menu" class="demo-section">
    <h3>Menu</h3>

    <h4>horizontal 横向模式</h4>
    <Menu
      :selected-keys="[current]"
      mode="horizontal"
      :items="items"
      @click="handleClick"
    />
  </section>
</template>

<style scoped>
h3 {
  margin: 20px 0 4px;
}

h4 {
  margin: 16px 0 4px;
}

p {
  margin: 8px 0;
  color: #666;
}
</style>
