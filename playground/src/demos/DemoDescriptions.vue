<script setup lang="ts">
import { Button, Descriptions, DescriptionsItem } from '@arvin-studio/ui';

/** Descriptions items 配置式（label / content） */
const descItems = [
  { key: 'p1', label: '商品', content: '机械键盘' },
  { key: 'p2', label: '数量', content: '1' },
  { key: 'p3', label: '单价', content: '¥399' },
  { key: 'p4', label: '小计', content: '¥399' },
  { key: 'p5', label: '优惠', content: '-¥20' },
  { key: 'p6', label: '实付', content: '¥379' },
];
</script>

<template>
  <section id="demo-descriptions" class="demo-section">
    <h3>Descriptions</h3>

    <h4>基础用法（title + DescriptionsItem 子项）</h4>
    <div class="desc-box">
      <Descriptions title="用户信息">
        <DescriptionsItem label="用户名">Arvin</DescriptionsItem>
        <DescriptionsItem label="邮箱">arvin@example.com</DescriptionsItem>
        <DescriptionsItem label="手机号">138-0000-0000</DescriptionsItem>
        <DescriptionsItem label="状态">在职</DescriptionsItem>
        <DescriptionsItem label="部门">前端团队</DescriptionsItem>
        <DescriptionsItem label="入职时间">2024-01-15</DescriptionsItem>
      </Descriptions>
    </div>

    <h4>bordered 边框 + column 列数</h4>
    <div class="desc-box">
      <Descriptions title="订单信息" bordered :column="3">
        <DescriptionsItem label="订单号">AS20240001</DescriptionsItem>
        <DescriptionsItem label="商品">无线鼠标</DescriptionsItem>
        <DescriptionsItem label="数量">2</DescriptionsItem>
        <DescriptionsItem label="单价">¥129</DescriptionsItem>
        <DescriptionsItem label="总价">¥258</DescriptionsItem>
        <DescriptionsItem label="配送方式">顺丰速运</DescriptionsItem>
      </Descriptions>
    </div>

    <h4>items 配置式</h4>
    <div class="desc-box">
      <Descriptions :items="descItems" bordered />
    </div>

    <h4>layout="vertical" 垂直布局 + size="small"</h4>
    <div class="desc-box">
      <Descriptions title="项目信息" layout="vertical" size="small">
        <DescriptionsItem label="项目名称">As UI Next</DescriptionsItem>
        <DescriptionsItem label="负责人">Arvin</DescriptionsItem>
        <DescriptionsItem label="版本">v1.0.0</DescriptionsItem>
      </Descriptions>
    </div>

    <h4>title / extra + span 合并 / #content 插槽</h4>
    <div class="desc-box">
      <Descriptions title="账号信息" bordered>
        <template #extra><Button size="small">编辑</Button></template>
        <DescriptionsItem label="昵称">Arvin</DescriptionsItem>
        <DescriptionsItem label="简介">
          <template #content><b>资深前端工程师</b></template>
        </DescriptionsItem>
        <DescriptionsItem :span="2" label="收货地址">
          浙江省杭州市西湖区 xxx 路 88 号
        </DescriptionsItem>
      </Descriptions>
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

.desc-box {
  width: 100%;
  max-width: 720px;
  padding: 8px 0;
}
</style>
