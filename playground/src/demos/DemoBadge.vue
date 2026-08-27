<script setup lang="ts">
import { ref } from 'vue';

import {
  Avatar,
  Badge,
  BadgeRibbon,
  Button,
} from '@arvin-studio/ui';

/** Badge 演示状态（count 动态增减，观察数字滚动动画） */
const badgeCount = ref(5);
const increaseBadge = () => {
  badgeCount.value += 1;
};
const decreaseBadge = () => {
  badgeCount.value = Math.max(0, badgeCount.value - 1);
};
</script>

<template>
    <section id="demo-badge" class="demo-section">
      <h3>Badge</h3>

      <h4>count 数字徽标（含 overflowCount / showZero）</h4>
      <div class="row">
        <Badge :count="badgeCount">
          <Avatar shape="square" size="large">U</Avatar>
        </Badge>
        <Button @click="increaseBadge">+1</Button>
        <Button @click="decreaseBadge">-1</Button>
        <Badge :count="0" show-zero>
          <Avatar shape="square" size="large">U</Avatar>
        </Badge>
        <Badge :count="100" :overflow-count="99">
          <Avatar shape="square" size="large">U</Avatar>
        </Badge>
        <span class="hint">
          count 变化带数字滚动动画；100 超出 overflowCount 显示 99+
        </span>
      </div>
      <h4>dot 红点</h4>
      <div class="row">
        <Badge dot>
          <Button>通知</Button>
        </Badge>
        <Badge dot color="green">
          <Button>在线</Button>
        </Badge>
      </div>
      <h4>status 状态点 + text</h4>
      <div class="row">
        <Badge status="success" text="成功" />
        <Badge status="processing" text="处理中" />
        <Badge status="warning" text="警告" />
        <Badge status="error" text="错误" />
        <Badge status="default" text="默认" />
      </div>
      <h4>color 自定义颜色（count / dot / 状态点）</h4>
      <div class="row">
        <Badge :count="6" color="pink">
          <Button>pink</Button>
        </Badge>
        <Badge :count="9" color="#52c41a">
          <Button>自定义色</Button>
        </Badge>
        <Badge dot color="volcano">
          <Button>volcano</Button>
        </Badge>
        <Badge color="gold" text="gold 状态点" />
      </div>
      <h4>#count 插槽（自定义徽标内容）</h4>
      <div class="row">
        <Badge>
          <template #count>
            <span>🔥</span>
          </template>
          <Button>插槽 count</Button>
        </Badge>
      </div>

      <h4>offset 偏移</h4>
      <div class="row">
        <Badge :count="8" :offset="[6, -6]">
          <Button>右上偏移</Button>
        </Badge>
        <Badge :count="8" :offset="[-6, 6]">
          <Button>左下偏移</Button>
        </Badge>
      </div>

      <h4>BadgeRibbon 缎带</h4>
      <div class="row">
        <BadgeRibbon text="HOT" color="red">
          <div class="ribbon-card">缎带卡片内容</div>
        </BadgeRibbon>
      </div>
      <div class="row">
        <BadgeRibbon text="新品" color="blue" placement="start">
          <div class="ribbon-card">placement="start"</div>
        </BadgeRibbon>
      </div>
    </section>
</template>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  padding: 8px 0;
}
.hint {
  color: #999;
  font-size: 12px;
}
h3 {
  margin: 20px 0 4px;
}

h4 {
  margin: 16px 0 4px;
}

.ribbon-card {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 220px;
  height: 120px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
}
</style>
