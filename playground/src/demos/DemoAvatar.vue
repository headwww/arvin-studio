<script setup lang="ts">
import { Avatar, AvatarGroup } from '@arvin-studio/ui';

/** Avatar 演示用图片地址 */
const avatarSrc = 'https://i.pravatar.cc/100?img=12';
/** 必然加载失败的地址，用于演示图片错误回退 */
const badSrc = 'https://example.com/not-exist.png';
/** 返回 false 阻止默认回退（展示破图），可自行处理错误 */
const onAvatarError = () => {
  console.log('Avatar 图片加载失败');
  return false;
};
</script>

<template>
    <section id="demo-avatar" class="demo-section">
      <h3>Avatar</h3>

      <h4>基础用法（文字 / 图片 / 图标）</h4>
      <div class="row">
        <Avatar>U</Avatar>
        <Avatar :src="avatarSrc" alt="avatar" />
        <Avatar icon="🧑💻" />
        <Avatar>张三</Avatar>
      </div>

      <h4>size 尺寸（预设 / 数字 / 响应式）</h4>
      <div class="row">
        <Avatar size="small">S</Avatar>
        <Avatar size="medium">M</Avatar>
        <Avatar size="large">L</Avatar>
        <Avatar :size="64">64</Avatar>
        <Avatar :size="{ xs: 24, md: 48, xl: 64 }">R</Avatar>
        <span class="hint">响应式 size：拖动窗口宽度观察变化</span>
      </div>

      <h4>shape 形状</h4>
      <div class="row">
        <Avatar shape="circle">circle</Avatar>
        <Avatar shape="square">square</Avatar>
        <Avatar :size="48" shape="square" :src="avatarSrc" />
      </div>

      <h4>icon 插槽 / gap 文字间距</h4>
      <div class="row">
        <Avatar>
          <template #icon>🎨</template>
        </Avatar>
        <Avatar :size="64" :gap="2">头像文字很长</Avatar>
        <Avatar :size="64" :gap="10">头像文字很长</Avatar>
      </div>

      <h4>图片加载失败回退（onError）</h4>
      <div class="row">
        <Avatar :src="badSrc" alt="加载失败">Fallback</Avatar>
        <Avatar :src="badSrc" alt="阻止回退" :on-error="onAvatarError">
          自定义
        </Avatar>
        <span class="hint">
          左侧失败后回退显示文字；右侧 onError 返回 false 阻止默认回退
        </span>
      </div>

      <h4>AvatarGroup（基础 / max 折叠 + Popover）</h4>
      <div class="row">
        <AvatarGroup>
          <Avatar>U</Avatar>
          <Avatar>B</Avatar>
          <Avatar icon="🧑💻" />
          <Avatar :src="avatarSrc" />
          <Avatar>陈</Avatar>
        </AvatarGroup>
      </div>
      <div class="row">
        <AvatarGroup :max="{ count: 3 }">
          <Avatar>U</Avatar>
          <Avatar>B</Avatar>
          <Avatar>C</Avatar>
          <Avatar>D</Avatar>
          <Avatar>E</Avatar>
          <Avatar>F</Avatar>
        </AvatarGroup>
        <AvatarGroup
          :max="{
            count: 4,
            popover: { placement: 'bottom', trigger: 'click' },
          }"
        >
          <Avatar>U</Avatar>
          <Avatar>B</Avatar>
          <Avatar>C</Avatar>
          <Avatar>D</Avatar>
          <Avatar>E</Avatar>
        </AvatarGroup>
        <span class="hint">
          max 折叠后剩余头像通过 Popover 查看（右侧为 click 触发）
        </span>
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
</style>
